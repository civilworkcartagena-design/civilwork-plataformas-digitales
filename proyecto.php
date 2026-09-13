<?php
declare(strict_types=1);
require_once __DIR__ . '/api_config.php';

$slug = isset($_GET['c']) ? strtolower(trim((string) $_GET['c'])) : '';
if (!preg_match('/^[a-z0-9_\-]{2,80}$/', $slug)) {
    http_response_code(400);
    $response = ['ok' => false, 'status' => 400, 'error' => 'El identificador del proyecto no es válido.', 'data' => []];
} else {
    $response = civilwork_api_get('/api/dashboard-data?c=' . rawurlencode($slug));
}

$project = $response['ok'] && is_array($response['data']) ? $response['data'] : [];
// Published weekly report: use only while the API has no newer report.
$weeklyReportActive = false;
if ($slug === 'los_corales') {
    $reportPath = __DIR__ . '/reports/los-corales-semana-01.json';
    $weekly = is_file($reportPath) ? json_decode((string) file_get_contents($reportPath), true) : null;
    $apiDate = strtotime((string) ($project['fecha_informe'] ?? ''));
    if (is_array($weekly) && (!$apiDate || $apiDate <= strtotime($weekly['fecha_informe']))) {
        $project = array_replace($project, $weekly);
        $response['ok'] = true;
        $weeklyReportActive = true;
    }
}

$title = project_value($project, 'proyecto', 'Detalle del proyecto');
$client = project_value($project, 'cliente', 'Cliente no publicado');
$description = project_value($project, 'descripcion', 'Seguimiento técnico y documental del proyecto.');
$location = project_value($project, 'ubicacion');
$state = (string) ($project['estado'] ?? 'pendiente');
$stateClass = preg_replace('/[^a-z0-9_-]/', '', strtolower($state)) ?: 'pendiente';
$phases = isset($project['fases']) && is_array($project['fases']) ? $project['fases'] : [];
$activities = isset($project['actividades']) && is_array($project['actividades']) ? $project['actividades'] : [];
$photos = isset($project['fotos']) && is_array($project['fotos']) ? $project['fotos'] : [];
if (!$photos && !empty($project['foto_urls']) && is_array($project['foto_urls'])) {
    foreach ($project['foto_urls'] as $url) {
        $photos[] = ['url' => $url, 'descripcion' => '', 'fecha' => $project['fecha_informe'] ?? ''];
    }
}

$metrics = [
    'integral' => ['label' => 'Avance integral', 'value' => percentage($project['avance_integral'] ?? $project['avance_general'] ?? 0)],
    'fisico' => ['label' => 'Avance físico', 'value' => percentage($project['avance_fisico'] ?? $project['avance_general'] ?? 0)],
    'economico' => ['label' => 'Avance económico', 'value' => percentage($project['avance_economico'] ?? 0)],
    'abastecimiento' => ['label' => 'Abastecimiento', 'value' => percentage($project['avance_abastecimiento'] ?? 0)],
];
if ($weeklyReportActive) {
    $metrics = [
        'integral' => ['label' => 'Global verificado · 10 Sep', 'value' => 8],
        'meta' => ['label' => 'Meta operativa · no verificada', 'value' => 12],
        'base' => ['label' => 'Curva S · Semana 1', 'value' => 4],
        'hito' => ['label' => 'Hito contractual · Semana 5', 'value' => 50],
    ];
}
$integral = $metrics['integral']['value'];
$completedPhases = 0;
foreach ($phases as $phase) {
    $phaseState = (string) ($phase['estado'] ?? '');
    if (in_array($phaseState, ['ejecutado', 'completado', 'finalizado'], true) || percentage($phase['porcentaje'] ?? 0) >= 100) {
        $completedPhases++;
    }
}

$layerDefinitions = [
    'Terreno y cimentación' => ['preliminar', 'terreno', 'ciment', 'excav', 'pilot'],
    'Estructura' => ['estruct', 'concreto', 'mamposter', 'cubierta'],
    'Envolvente' => ['fachada', 'cerramiento', 'ventana', 'impermeabil'],
    'Sistemas técnicos' => ['eléct', 'electr', 'hidrául', 'hidraul', 'sanitar', 'redes', 'mecán'],
    'Acabados y entrega' => ['acabado', 'pintura', 'carpinter', 'entrega', 'aseo'],
];
$layerGroups = array_fill_keys(array_keys($layerDefinitions), []);
$unassignedLayers = [];
foreach ($phases as $phase) {
    $phaseName = strtolower((string) ($phase['nombre'] ?? $phase['fase'] ?? ''));
    $assigned = false;
    foreach ($layerDefinitions as $group => $keywords) {
        foreach ($keywords as $keyword) {
            if ($phaseName !== '' && strpos($phaseName, $keyword) !== false) {
                $layerGroups[$group][] = $phase;
                $assigned = true;
                break 2;
            }
        }
    }
    if (!$assigned) {
        $unassignedLayers[] = $phase;
    }
}
if ($unassignedLayers) {
    $layerGroups['Otros frentes'] = $unassignedLayers;
}

if ($slug === 'los_corales') {
    $layerGroups = [];
    foreach ($activities as $activity) {
        $group = (string) ($activity['frente'] ?? $activity['fase'] ?? 'Otros trabajos de adecuación');
        $layerGroups[$group][] = [
            'nombre' => $activity['actividad'] ?? $activity['nombre'] ?? 'Actividad',
            'porcentaje' => $activity['porcentaje'] ?? null,
            'estado' => $activity['estado'] ?? 'pendiente',
        ];
    }
}

$timeline = [
    ['label' => 'Inicio', 'detail' => 'Apertura del seguimiento'],
    ['label' => 'Ejecución', 'detail' => 'Control técnico y documental'],
    ['label' => 'Entrega', 'detail' => 'Recepción de obra'],
    ['label' => 'Cierre', 'detail' => 'Consolidación final'],
];
$currentTimeline = 0;
if (in_array($state, ['en_ejecucion', 'en_proceso'], true)) {
    $currentTimeline = 1;
} elseif (in_array($state, ['ejecutado', 'completado', 'finalizado'], true)) {
    $currentTimeline = 3;
}

$nextActivity = project_value($project, 'siguiente_actividad', project_value($project, 'recomendaciones', 'Sin actividad publicada'));
$lastUpdate = project_value($project, 'ultima_actualizacion', project_value($project, 'fecha_informe', 'Sin informes procesados'));
$seoDescription = substr($description, 0, 155);
$canonical = 'https://civilwork.com.co/proyecto.php?c=' . rawurlencode($slug);
$socialImage = '';
if (!empty($photos[0]['url']) && preg_match('#^https?://#i', (string) $photos[0]['url'])) {
    $socialImage = (string) $photos[0]['url'];
}
$clientData = [
    'slug' => $slug,
    'project' => $title,
    'state' => $state,
    'progress' => $integral,
    'metrics' => $metrics,
    'phaseCount' => count($phases),
];
?>
<!doctype html>
<html lang="es" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="<?= h($seoDescription) ?>">
  <meta name="theme-color" content="#0C0F14">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CO">
  <meta property="og:title" content="<?= h($title) ?> | Civil Work">
  <meta property="og:description" content="<?= h($seoDescription) ?>">
  <meta property="og:url" content="<?= h($canonical) ?>">
  <?php if ($socialImage !== ''): ?><meta property="og:image" content="<?= h($socialImage) ?>"><?php endif; ?>
  <link rel="canonical" href="<?= h($canonical) ?>">
  <link rel="icon" type="image/png" href="assets/images/civilwork-logo-transparent.png">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <title><?= h($title) ?> | Civil Work</title>
  <link rel="stylesheet" href="assets/css/civilwork-dashboard.css?v=2">
  <link rel="stylesheet" href="assets/css/civilwork-project-3d.css?v=2">
  <link rel="stylesheet" href="assets/css/civilwork-editorial.css?v=1">
  <script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');</script>
  <script type="importmap">{"imports":{"three":"./assets/js/vendor/three.module.min.js"}}</script>
</head>
<body class="project-page editorial-page state-<?= h($stateClass) ?>">
  <a class="skip-link" href="#project-content">Saltar al contenido</a>
  <div class="page-loader" data-page-loader role="status" aria-live="polite">
    <img src="assets/images/civilwork-logo-transparent.png" alt="" width="156" height="80">
    <span>Preparando sala de control</span>
    <i aria-hidden="true"></i>
  </div>
  <div class="site-noise" aria-hidden="true"></div>
  <div class="custom-cursor" data-cursor aria-hidden="true"><span></span></div>

  <header class="control-header" data-header>
    <a class="brand-lockup" href="hub.php" aria-label="Civil Work — todos los proyectos">
      <span class="brand-plate"><img src="assets/images/civilwork-logo-transparent.png" alt="Civil Work" width="156" height="80"></span>
    </a>
    <div class="header-signal" aria-label="Estado de conexión">
      <span class="live-dot" aria-hidden="true"></span>
      <span>Seguimiento de obra</span>
    </div>
    <nav class="project-nav" aria-label="Navegación del proyecto">
      <a href="#telemetria">Avance</a>
      <a href="#actividades">Actividades</a>
      <a href="#bitacora">Fotografías</a>
      <a class="nav-hub" href="hub.php">Proyectos <span aria-hidden="true">↗</span></a>
    </nav>
  </header>

  <main id="project-content">
    <?php if (!$response['ok']): ?>
      <section class="error-stage" aria-labelledby="error-title">
        <div class="error-code">API / <?= (int) ($response['status'] ?? 0) ?></div>
        <p class="section-kicker">Estado de plataforma</p>
        <h1 id="error-title">Proyecto no disponible</h1>
        <p><?= h($response['error']) ?></p>
        <div class="error-actions">
          <a class="action-link action-link--solid" href="<?= h($canonical) ?>">Reintentar</a>
          <a class="action-link" href="hub.php">Volver a proyectos</a>
        </div>
        <p class="error-detail">La interfaz está operativa, pero la API aún no publicó este proyecto. Verifica que Render despliegue la rama <strong>main</strong>.</p>
      </section>
    <?php else: ?>
      <section class="project-hero" id="resumen" data-hero>
        <?php if (!empty($photos[0]['url'])): ?>
        <img class="editorial-hero-image" src="<?= h($photos[0]['url']) ?>" alt="" fetchpriority="high">
        <?php endif; ?><div class="editorial-hero-shade" aria-hidden="true"></div>
        <div class="hero-copy" data-reveal>
          <div class="status-chip status-chip--<?= h($stateClass) ?>"><span></span><?= h(status_label($state)) ?></div>
          <p class="hero-index">Proyecto / <?= h(strtoupper($slug)) ?></p>
          <h1><?= h($title) ?></h1>
          <p class="hero-client"><?= h($client) ?></p>
          <p class="hero-description"><?= h($description) ?></p>
          <?php if ($weeklyReportActive): ?><p class="report-reference">CW029-26 / SEMANA 01 / 7–12 SEP 2026</p><?php endif; ?>
          <div class="hero-actions">
            <a class="action-link action-link--solid" href="#telemetria">Explorar avance <span aria-hidden="true">↓</span></a>
            <?php if ($weeklyReportActive): ?><a class="text-link" href="reports/los-corales-semana-01-rev1.pdf" target="_blank" rel="noopener">Leer informe REV1 ↗</a><?php else: ?><a class="text-link" href="hub.php">Todos los proyectos ↗</a><?php endif; ?>
          </div>
        </div>
        <aside class="hero-telemetry" aria-label="Resumen del proyecto" data-reveal>
          <div class="telemetry-primary"><span><?= $weeklyReportActive ? "Global verificado · 10 Sep" : "Avance integral" ?></span><strong><?= $integral ?><small>%</small></strong></div>
          <dl>
            <div><dt>Ubicación</dt><dd><?= h($location) ?></dd></div>
            <div><dt>Último reporte</dt><dd><?= h($lastUpdate) ?></dd></div>
            <div><dt><?= $weeklyReportActive ? "Actividades" : "Fases" ?></dt><dd><?= $completedPhases ?> / <?= count($phases) ?></dd></div>
          </dl>
        </aside>
        <div class="hero-scroll" aria-hidden="true"><span></span>Descubrir el proyecto</div>
      </section>

      <section class="telemetry-section section-light" id="telemetria" aria-labelledby="telemetry-title">
        <div class="section-head" data-reveal>
          <div><p class="section-kicker">01 / Avance de obra</p><h2 id="telemetry-title">Pulso de ejecución</h2></div>
          <p><?= $weeklyReportActive ? "Semana 1 · 7 al 12 de septiembre. El 8% es el último global verificado; 12% y 50% son metas, no avance ejecutado." : "Lectura consolidada del último informe publicado." ?></p>
        </div>
        <div class="telemetry-layout">
          <div class="progress-ring" style="--value: <?= $integral ?>" role="img" aria-label="Avance integral: <?= $integral ?> por ciento" data-reveal>
            <div><strong><?= $integral ?></strong><span>%</span><small><?= $weeklyReportActive ? "verificado" : "integral" ?></small></div>
          </div>
          <div class="metric-wall">
            <?php foreach ($metrics as $metric): ?>
              <article class="metric-block" data-reveal>
                <span><?= h($metric['label']) ?></span>
                <strong data-counter="<?= (int) $metric['value'] ?>"><?= (int) $metric['value'] ?><small>%</small></strong>
                <div class="metric-line"><i style="--metric: <?= (int) $metric['value'] ?>%"></i></div>
              </article>
            <?php endforeach; ?>
          </div>
        </div>
        <div class="telemetry-strip" data-reveal>
          <div><span><?= $weeklyReportActive ? "Actividades completadas" : "Fases completadas" ?></span><strong><?= $completedPhases ?> / <?= count($phases) ?></strong></div>
          <div><span>Próxima actividad</span><strong><?= h($nextActivity) ?></strong></div>
          <div><span>Última actualización</span><strong><?= h($lastUpdate) ?></strong></div>
        </div>
      </section>

      <section class="layers-section section-dark" id="capas" aria-labelledby="layers-title">
        <div class="section-head section-head--dark" data-reveal>
          <div><p class="section-kicker">02 / Frentes de trabajo</p><h2 id="layers-title">Sistemas de obra</h2></div>
          <p>Actividades agrupadas por frente. Sus porcentajes individuales no equivalen al avance global de la obra.</p>
        </div>
        <div class="layer-stack">
          <?php $layerIndex = 0; foreach ($layerGroups as $groupName => $groupPhases): $layerIndex++; ?>
            <details class="layer-row" <?= $layerIndex === 1 ? 'open' : '' ?> data-reveal>
              <summary>
                <span class="layer-number"><?= str_pad((string) $layerIndex, 2, '0', STR_PAD_LEFT) ?></span>
                <strong><?= h($groupName) ?></strong>
                <span><?= count($groupPhases) ?> <?= count($groupPhases) === 1 ? 'actividad' : 'actividades' ?></span>
                <i aria-hidden="true"></i>
              </summary>
              <div class="layer-content">
                <?php if (!$groupPhases): ?><p>Sin fases asociadas en el reporte actual.</p><?php endif; ?>
                <?php foreach ($groupPhases as $phase): $phaseProgress = isset($phase['porcentaje']) ? percentage($phase['porcentaje']) : null; ?>
                  <div class="layer-phase">
                    <div><span><?= h($phase['nombre'] ?? $phase['fase'] ?? 'Fase') ?></span><small><?= h(status_label((string) ($phase['estado'] ?? 'pendiente'))) ?></small></div>
                    <strong><?= $phaseProgress !== null ? $phaseProgress . "%" : "Por ejecutar" ?></strong>
                    <?php if ($phaseProgress !== null): ?><div class="layer-track"><i style="--layer-progress: <?= $phaseProgress ?>%"></i></div><?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
            </details>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="activities-section section-light" id="actividades" aria-labelledby="activities-title">
        <div class="section-head" data-reveal>
          <div><p class="section-kicker">03 / Actividades</p><h2 id="activities-title">Matriz operativa</h2></div>
          <p><?= count($activities) ?> actividades: ejecución reportada y trabajos futuros. Las ofertas pendientes no se consideran aprobadas.</p>
        </div>
        <div class="activity-filters" role="group" aria-label="Filtrar actividades" data-reveal>
          <button class="is-active" type="button" data-filter="all" aria-pressed="true">Todas</button>
          <button type="button" data-filter="ejecutado" aria-pressed="false">Ejecutadas</button>
          <button type="button" data-filter="en_ejecucion" aria-pressed="false">En ejecución</button>
          <button type="button" data-filter="pendiente" aria-pressed="false">Pendientes</button>
        </div>
        <?php if ($activities): ?>
          <div class="activity-table" role="table" aria-label="Actividades del proyecto" data-reveal>
            <div class="activity-table__head" role="row"><span role="columnheader">ID</span><span role="columnheader">Actividad</span><span role="columnheader">Estado</span><span role="columnheader">Frente</span></div>
            <?php foreach ($activities as $index => $activity):
              $activityState = (string) ($activity['estado'] ?? 'pendiente');
              if (in_array($activityState, ['completado', 'finalizado'], true)) {
                  $normalizedState = 'ejecutado';
              } else {
                  $normalizedState = $activityState === 'en_proceso' ? 'en_ejecucion' : $activityState;
              }
            ?>
              <article class="activity-row" role="row" data-activity-state="<?= h($normalizedState) ?>">
                <span role="cell"><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span>
                <strong role="cell"><?= h($activity['actividad'] ?? $activity['nombre'] ?? 'Actividad') ?></strong>
                <span role="cell"><i class="state-indicator state-indicator--<?= h($normalizedState) ?>"></i><?= h(status_label($activityState)) ?></span>
                <span role="cell"><?= h($activity['fase'] ?? $activity['frente'] ?? 'General') ?><small class="activity-followup"><?= h($activity['seguimiento'] ?? '') ?></small></span>
              </article>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <p class="empty-state">Aún no hay actividades reportadas.</p>
        <?php endif; ?>
      </section>

      <section class="journal-section section-paper" id="bitacora" aria-labelledby="journal-title">
        <div class="section-head" data-reveal>
          <div><p class="section-kicker">04 / Evidencia de obra</p><h2 id="journal-title">Bitácora visual</h2></div>
          <p>Evidencia publicada por el equipo de obra. Selecciona una imagen para verla en detalle.</p>
        </div>
        <?php if ($photos): ?>
          <div class="journal-track" data-photo-track>
            <?php foreach ($photos as $index => $photo):
              $photoDescription = trim((string) ($photo['descripcion'] ?? ''));
              $photoCaption = $photoDescription !== '' ? $photoDescription : 'Registro fotográfico de obra';
            ?>
              <figure class="journal-photo" data-reveal>
                <button type="button" data-lightbox-src="<?= h($photo['url'] ?? '') ?>" data-lightbox-alt="<?= h($photoCaption) ?>">
                  <img src="<?= h($photo['url'] ?? '') ?>" alt="<?= h($photoCaption) ?>" loading="lazy" decoding="async">
                  <span aria-hidden="true">Ampliar ↗</span>
                </button>
                <figcaption><span><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span><div><?= h($photoCaption) ?><small><?= h($photo['fecha'] ?? 'Fecha no publicada') ?></small></div></figcaption>
              </figure>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <div class="journal-empty" data-reveal><span>00</span><p>El proyecto aún no tiene fotografías publicadas.</p></div>
        <?php endif; ?>
      </section>

      <section class="notes-section section-dark" id="notas" aria-labelledby="notes-title">
        <div class="section-head section-head--dark" data-reveal>
          <div><p class="section-kicker">05 / Seguimiento técnico</p><h2 id="notes-title">Lectura de ingeniería</h2></div>
          <p>Controles técnicos del informe y decisiones de contratación pendientes informadas por el equipo de obra.</p>
        </div>
        <?php if ($slug === 'los_corales' && !empty($project['formalizaciones'])): ?>
        <div class="approval-intro"><p class="section-kicker">Decisiones pendientes del cliente</p><h3>Formalizar para programar.</h3><p>Prioridad: fachada, clósets y puertas, y terraza. Estos alcances cuentan con ofertas que aún requieren formalización.</p></div>
        <div class="approval-grid">
          <?php foreach ($project['formalizaciones'] as $offer): ?>
          <article class="approval-card">
            <span class="approval-number"><?= h($offer['prioridad']) ?></span>
            <div><span class="approval-state"><?= h($offer['estado']) ?></span><h3><?= h($offer['nombre']) ?></h3><p><?= h($offer['detalle']) ?></p></div>
          </article>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <div class="notes-grid">
          <article class="note-card note-card--wide" data-reveal><span>Observaciones</span><p><?= h(project_value($project, 'observaciones', 'Sin observaciones registradas.')) ?></p></article>
          <article class="note-card" data-reveal><span>Recomendaciones</span><p><?= h(project_value($project, 'recomendaciones', 'Sin recomendaciones registradas.')) ?></p></article>
          <article class="note-card" data-reveal><span>Siguiente actividad</span><p><?= h($nextActivity) ?></p></article>
          <article class="note-card note-card--risk" data-reveal><span>Riesgos registrados</span><p><?= h(project_value($project, "riesgos", "Sin información de riesgos publicada.")) ?></p></article>
        </div>
      </section>

      <section class="timeline-section section-light" id="cronologia" aria-labelledby="timeline-title">
        <div class="section-head" data-reveal>
          <div><p class="section-kicker">06 / Cronología</p><h2 id="timeline-title">Estado relativo</h2></div>
          <p>Secuencia orientativa basada en el estado general; la API no publica fechas contractuales por hito.</p>
        </div>
        <ol class="project-timeline" data-reveal>
          <?php foreach ($timeline as $index => $milestone):
            $milestoneClass = $index < $currentTimeline ? 'is-complete' : ($index === $currentTimeline ? 'is-current' : 'is-pending');
          ?>
            <li class="<?= $milestoneClass ?>"><i aria-hidden="true"></i><span><?= h($milestone['label']) ?></span><strong><?= h($milestone['detail']) ?></strong><small><?= $index === $currentTimeline ? 'Etapa actual' : ($index < $currentTimeline ? 'Etapa superada' : 'Pendiente') ?></small></li>
          <?php endforeach; ?>
        </ol>
      </section>


    <?php endif; ?>
  </main>

  <footer class="control-footer">
    <div class="footer-brand"><span class="brand-plate"><img src="assets/images/civilwork-logo-transparent.png" alt="Civil Work" width="156" height="80"></span><p>Control técnico de proyectos.<br>Cartagena de Indias, Colombia.</p></div>
    <div><span>Proyecto</span><strong><?= h($title) ?></strong></div>
    <div><span>Plataforma</span><a href="hub.php">Project Tracking Hub ↗</a></div>
  </footer>

  <dialog class="lightbox" data-lightbox aria-label="Vista ampliada de fotografía">
    <button type="button" data-lightbox-close aria-label="Cerrar imagen">×</button>
    <img src="" alt="">
    <p></p>
  </dialog>
  <script type="application/json" id="project-data"><?= json_encode($clientData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?></script>
  <noscript><div class="noscript-note">La información del proyecto está disponible, pero las animaciones requieren JavaScript.</div></noscript>
  <script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.25/dist/lenis.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
  <script defer src="assets/js/project-ui.js?v=2"></script>
  <script defer src="assets/js/project-motion.js?v=2"></script>

</body>
</html>
