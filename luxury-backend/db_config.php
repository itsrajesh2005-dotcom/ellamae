<?php

function getDbConfig(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $config = [
        'host' => getenv('DB_HOST') ?: '',
        'user' => getenv('DB_USER') ?: '',
        'pass' => getenv('DB_PASS') ?: '',
        'name' => getenv('DB_NAME') ?: '',
    ];

    $envFile = __DIR__ . '/.env';

    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            [$key, $value] = array_pad(explode('=', $line, 2), 2, '');

            $key = trim($key);
            $value = trim($value);

            if ($key === 'DB_HOST') $config['host'] = $value;
            if ($key === 'DB_USER') $config['user'] = $value;
            if ($key === 'DB_PASS') $config['pass'] = $value;
            if ($key === 'DB_NAME') $config['name'] = $value;
        }
    }

    $config['host'] = $config['host'] ?: '127.0.0.1';
    $config['user'] = $config['user'] ?: 'root';
    $config['name'] = $config['name'] ?: 'ellamae_db';

    return $config;
}
