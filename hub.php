<?php
declare(strict_types=1);
require_once __DIR__ . '/api_config.php';

$response = civilwork_api_get('/api/proyectos');
$projects = $response['ok'] && isset($response['data']['proyectos']) && is_array($response['data']['proyectos'])
    ? $response['data']['proyectos']
    : [];
$weeklyPath = __DIR__ . '/reports/los-corales-semana-01.json';
$weekly = is_file($weeklyPath) ? json_decode((string) file_get_contents($weeklyPath), true) : null;
foreach ($projects as &$entry) {
    if (($entry['slug'] ?? '') !== 'los_corales' || !is_array($weekly)) continue;
    $entryDate = civilwork_report_timestamp(
        $entry['fecha_informe'] ?? $entry['ultimo_informe'] ?? $entry['ultima_actualizacion'] ?? ''
    );
    $weeklyDate = civilwork_report_timestamp($weekly['fecha_informe'] ?? '');
    if (!$entryDate || ($weeklyDate && $entryDate <= $weeklyDate)) {
        $entry = array_replace($entry, [
            'estado' => $weekly['estado'], 'proyecto' => $weekly['proyecto'],
            'descripcion' => $weekly['descripcion'], 'avance_integral' => 8,
            'avance_fisico' => 8, 'fotos' => count($weekly['fotos']),
            'fases_listas' => count(array_filter($weekly['actividades'], static fn($a) => in_array($a['estado'] ?? '', ['completado', 'ejecutado'], true))), 'fases_total' => count($weekly['actividades']), 'weekly_report' => true,
            'total_informes' => max(1, (int) ($entry['total_informes'] ?? 0)),
        ]);
    }
}
unset($entry);
$activeProjects = 0;
foreach ($projects as $project) {
    if (in_array((string) ($project['estado'] ?? ''), ['en_ejecucion', 'en_proceso'], true)) {
        $activeProjects++;
    }
}
?>
<!doctype html>
<html lang="es" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Sala de control de proyectos de Civil Work: avance, fases, informes y evidencias de obra.">
  <meta name="theme-color" content="#0C0F14">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CO">
  <meta property="og:title" content="Project Tracking Hub | Civil Work">
  <meta property="og:description" content="Seguimiento técnico y documental de proyectos Civil Work.">
  <link rel="canonical" href="https://civilwork.com.co/hub.php">
  <link rel="icon" type="image/png" href="assets/images/civilwork-logo-transparent.png">
  <title>Project Tracking Hub | Civil Work</title>
  <link rel="stylesheet" href="assets/css/civilwork-dashboard.css?v=2">
  <link rel="stylesheet" href="assets/css/civilwork-editorial.css?v=1">
  <script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');</script>
</head>
<body class="hub-page editorial-page">
  <a class="skip-link" href="#hub-content">Saltar al contenido</a>
  <div class="page-loader" data-page-loader role="status" aria-live="polite">
    <img src="assets/images/civilwork-logo-transparent.png" alt="" width="156" height="80">
    <span>Sincronizando proyectos</span><i aria-hidden="true"></i>
  </div>
  <div class="site-noise" aria-hidden="true"></div>
  <div class="custom-cursor" data-cursor aria-hidden="true"><span></span></div>

  <header class="control-header control-header--hub" data-header>
    <a class="brand-lockup" href="/" aria-label="Civil Work — sitio principal"><span class="brand-plate"><img src="assets/images/civilwork-logo-transparent.png" alt="Civil Work" width="156" height="80"></span></a>
    <div class="header-signal"><span class="live-dot" aria-hidden="true"></span><span>Project tracking hub</span></div>
    <nav class="project-nav" aria-label="Navegación principal"><a href="#proyectos">Proyectos</a><a class="nav-hub" href="/">Sitio principal <span aria-hidden="true">↗</span></a></nav>
  </header>

  <main id="hub-content">
    <section class="hub-hero">
      <div class="hub-grid-lines" aria-hidden="true"></div>
      <div class="hub-hero__copy">
        <p class="section-kicker">Civil Work / Project intelligence</p>
        <h1>Control visible.<br><em>Decisiones precisas.</em></h1>
        <p>Una lectura consolidada de ejecución física, avance integral, fases, informes y evidencia fotográfica por obra.</p>
      </div>
      <div class="hub-console" aria-label="Resumen de plataforma">
        <div><span>Proyectos publicados</span><strong><?= count($projects) ?></strong></div>
        <div><span>En ejecución</span><strong><?= $activeProjects ?></strong></div>
        <div><span>Conexión API</span><strong class="api-state <?= $response['ok'] ? 'is-online' : 'is-offline' ?>"><?= $response['ok'] ? 'Online' : 'Sin conexión' ?></strong></div>
      </div>
      <a class="hub-scroll" href="#proyectos">Explorar portafolio <span aria-hidden="true">↓</span></a>
    </section>

    <section class="hub-projects" id="proyectos" aria-labelledby="projects-title">
      <div class="hub-projects__head">
        <div><p class="section-kicker">Portafolio activo</p><h2 id="projects-title">Obras en seguimiento</h2></div>
        <p>Selecciona un proyecto para entrar a su sala de control.</p>
      </div>

      <?php if (!$response['ok']): ?>
        <div class="platform-state platform-state--error">
          <span>API / <?= (int) ($response['status'] ?? 0) ?></span>
          <h3>No fue posible cargar el portafolio.</h3>
          <p><?= h($response['error']) ?> Verifica el despliegue del backend en Render e intenta nuevamente.</p>
          <a class="action-link action-link--solid" href="hub.php">Reintentar</a>
        </div>
      <?php elseif (!$projects): ?>
        <div class="platform-state"><span>00 / Proyectos</span><h3>Todavía no hay proyectos disponibles.</h3><p>La plataforma está conectada; el portafolio aparecerá cuando la API publique el primer proyecto.</p></div>
      <?php else: ?>
        <div class="project-grid">
          <?php foreach ($projects as $index => $project):
            $slug = (string) ($project['slug'] ?? '');
            $integral = percentage($project['avance_integral'] ?? $project['avance'] ?? 0);
            $physical = percentage($project['avance_fisico'] ?? $project['avance'] ?? 0);
            $projectState = (string) ($project['estado'] ?? 'pendiente');
            $projectStateClass = preg_replace('/[^a-z0-9_-]/', '', strtolower($projectState)) ?: 'pendiente';
          ?>
            <article class="project-card" data-cursor-label="Abrir" style="--card-index: <?= $index ?>">
              <div class="project-card__top"><span><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span><span class="status-chip status-chip--<?= h($projectStateClass) ?>"><i></i><?= h(status_label($projectState)) ?></span></div>
              <div class="project-card__body">
                <p><?= h($project['cliente'] ?? 'Civil Work') ?></p>
                <h3><?= h($project['proyecto'] ?? $project['cliente'] ?? 'Proyecto Civil Work') ?></h3>
                <p><?= h($project['descripcion'] ?? 'Seguimiento técnico y documental del proyecto.') ?></p>
              </div>
              <div class="project-card__telemetry">
                <div><span><?= !empty($project["weekly_report"]) ? "Verificado · 10 Sep" : "Integral" ?></span><strong><?= $integral ?>%</strong><i><b style="--progress: <?= $integral ?>%"></b></i></div>
                <div><span>Físico</span><strong><?= $physical ?>%</strong><i><b style="--progress: <?= $physical ?>%"></b></i></div>
              </div>
              <div class="project-card__meta">
                <div><strong><?= (int) ($project['fases_listas'] ?? 0) ?>/<?= (int) ($project['fases_total'] ?? 0) ?></strong><span><?= !empty($project["weekly_report"]) ? "Actividades" : "Fases" ?></span></div>
                <div><strong><?= (int) ($project['total_informes'] ?? 0) ?></strong><span>Informes</span></div>
                <div><strong><?= (int) ($project['fotos'] ?? 0) ?></strong><span>Fotos</span></div>
              </div>
              <a class="project-card__link" href="proyecto.php?c=<?= rawurlencode($slug) ?>" aria-label="Abrir proyecto <?= h($project['proyecto'] ?? $project['cliente'] ?? '') ?>"><span>Ver proyecto</span><i aria-hidden="true">↗</i></a>
            </article>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </section>
  </main>

  <footer class="control-footer">
    <div class="footer-brand"><span class="brand-plate"><img src="assets/images/civilwork-logo-transparent.png" alt="Civil Work" width="156" height="80"></span><p>Control técnico de proyectos.<br>Cartagena de Indias, Colombia.</p></div>
    <div><span>Plataforma</span><strong>Project Tracking Hub</strong></div>
    <div><span>Acceso</span><a href="/">civilwork.com.co ↗</a></div>
  </footer>
  <noscript><div class="noscript-note">El portafolio está disponible, pero las transiciones requieren JavaScript.</div></noscript>
  <script defer src="assets/js/project-ui.js?v=2"></script>
</body>
</html>
