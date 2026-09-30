<?php
declare(strict_types=1);

const CIVILWORK_API_BASE = 'https://civilwork-dashboard2.onrender.com';

function civilwork_api_base(): string
{
    $override = getenv('CIVILWORK_API_BASE');
    if (is_string($override) && preg_match('#^https?://#i', $override)) {
        return rtrim($override, '/');
    }
    return CIVILWORK_API_BASE;
}

function civilwork_api_get(string $path): array
{
    $url = civilwork_api_base() . '/' . ltrim($path, '/');
    $body = false;
    $status = 0;

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 35,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_USERAGENT => 'CivilWork-ControlRoom/2.0',
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 35,
                'header' => "Accept: application/json\r\nUser-Agent: CivilWork-ControlRoom/2.0\r\n",
                'ignore_errors' => true,
            ],
        ]);
        $body = @file_get_contents($url, false, $context);
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $match)) {
            $status = (int) $match[1];
        }
    }

    $data = is_string($body) ? json_decode($body, true) : null;
    if ($status < 200 || $status >= 300 || !is_array($data)) {
        return [
            'ok' => false,
            'status' => $status,
            'error' => $status === 404
                ? 'El proyecto todavía no está disponible en la API.'
                : 'No fue posible consultar la plataforma en este momento.',
            'data' => [],
        ];
    }

    return ['ok' => true, 'status' => $status, 'error' => null, 'data' => $data];
}

function h($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function percentage($value): int
{
    return max(0, min(100, (int) round((float) $value)));
}

function civilwork_report_timestamp($value): int
{
    $date = trim((string) $value);
    if ($date === '') {
        return 0;
    }

    foreach (['!d/m/Y', '!Y-m-d', '!Y-m-d H:i:s'] as $format) {
        $parsed = DateTimeImmutable::createFromFormat($format, $date);
        if ($parsed instanceof DateTimeImmutable) {
            return $parsed->getTimestamp();
        }
    }

    $timestamp = strtotime($date);
    return $timestamp === false ? 0 : $timestamp;
}

function money_cop($value): string
{
    if ($value === null || $value === '') {
        return 'Sin dato';
    }
    return '$' . number_format((float) $value, 0, ',', '.') . ' COP';
}

function status_label(string $status): string
{
    $labels = [
        'pre_inicio' => 'Preinicio',
        'pendiente' => 'Pendiente',
        'en_ejecucion' => 'En ejecución',
        'en_proceso' => 'En proceso',
        'ejecutado' => 'Ejecutado',
        'completado' => 'Completado',
        'finalizado' => 'Finalizado',
    ];
    return $labels[$status] ?? ucfirst(str_replace('_', ' ', $status));
}

function project_value(array $project, string $key, string $fallback = 'Sin dato'): string
{
    $rawValue = $project[$key] ?? '';
    if (is_array($rawValue)) {
        $parts = array_map(static function ($item): string {
            if (is_numeric($item)) {
                return (string) $item . '%';
            }
            return trim((string) $item);
        }, $rawValue);
        $rawValue = implode(' / ', array_filter($parts, static fn(string $item): bool => $item !== ''));
    }
    $value = trim((string) $rawValue);
    return $value !== '' ? $value : $fallback;
}
