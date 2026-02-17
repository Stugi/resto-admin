-- ============================================================
-- Плотные бронирования: 17 февраля – 17 марта 2026
-- 100%+ загрузка в пиковые часы (все 32 стола заняты)
-- ~120-150 бронирований в день для красивой тепловой карты
-- ============================================================

-- Сначала удаляем все существующие брони
DELETE FROM reservations;

DO $$
DECLARE
    -- Массивы ID гостей и столов
    guest_ids text[];
    table_ids text[];
    table_caps int[];
    g_count int;
    t_count int;

    -- Итерация
    d date;
    slot_idx int;
    g_idx int;
    t_idx int;
    cap int;
    ppl int;
    h_start int;
    m_start int;
    dur_minutes int;
    ts_start timestamp;
    ts_end timestamp;
    res_status text;
    res_comment text;
    slots_per_day int;
    rnd float;
    day_of_week int;
    is_past boolean;
    total_created int := 0;

    -- Комментарии (NULL = без комментария)
    comments text[] := ARRAY[
        NULL, NULL, NULL, NULL, NULL, NULL, NULL,
        'День рождения',
        'Аллергия на орехи',
        'Просят стол у окна',
        'VIP гость',
        'Юбилей',
        'Деловой ужин',
        'Свидание',
        'Просят детский стул',
        'Безглютеновое меню',
        'Годовщина свадьбы',
        'Корпоратив',
        'Бизнес-ланч',
        'Вегетарианское меню',
        'Празднование повышения',
        'Встреча друзей',
        'Предложение руки',
        NULL, NULL, NULL, NULL, NULL
    ];

    -- Временные слоты с ТЯЖЁЛЫМИ весами на пиковые часы
    -- Обед: пик в 13:00-14:00 (много повторений = больше броней в эти часы)
    lunch_hours int[] := ARRAY[12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14];
    -- Ужин: мощный пик 19:00-20:00 (очень много повторений)
    dinner_hours int[] := ARRAY[
        17, 17, 17,
        18, 18, 18, 18, 18, 18,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19,
        20, 20, 20, 20, 20, 20, 20, 20, 20,
        21, 21, 21, 21, 21,
        22, 22, 22
    ];

BEGIN
    SELECT array_agg(id ORDER BY random()) INTO guest_ids FROM guests;
    g_count := array_length(guest_ids, 1);

    SELECT array_agg(id ORDER BY random()), array_agg(capacity ORDER BY random())
    INTO table_ids, table_caps FROM tables;
    t_count := array_length(table_ids, 1);

    IF g_count IS NULL OR t_count IS NULL THEN
        RAISE EXCEPTION 'Нет гостей или столов в БД. Сначала выполните seed.';
    END IF;

    FOR d IN SELECT generate_series('2026-02-17'::date, '2026-03-17'::date, '1 day'::interval)::date
    LOOP
        day_of_week := EXTRACT(DOW FROM d)::int;
        is_past := d < CURRENT_DATE;

        -- 100% заполняемость: нужно ~120-150 бронирований в день
        -- 32 стола × ~4-5 смен за рабочий день (12:00-23:00 = 11 часов, бронь 2ч)
        IF day_of_week IN (5, 6) THEN
            slots_per_day := 140 + floor(random() * 16)::int;  -- 140-155 (пт/сб)
        ELSIF day_of_week = 0 THEN
            slots_per_day := 120 + floor(random() * 16)::int;  -- 120-135 (вс)
        ELSE
            slots_per_day := 110 + floor(random() * 21)::int;  -- 110-130 (будни)
        END IF;

        FOR slot_idx IN 1..slots_per_day
        LOOP
            g_idx := 1 + floor(random() * g_count)::int;
            t_idx := 1 + floor(random() * t_count)::int;
            IF g_idx > g_count THEN g_idx := g_count; END IF;
            IF t_idx > t_count THEN t_idx := t_count; END IF;

            cap := table_caps[t_idx];
            ppl := 1 + floor(random() * cap)::int;
            IF ppl > cap THEN ppl := cap; END IF;
            IF ppl < 1 THEN ppl := 2; END IF;

            -- Распределение: обед 25%, ужин 75%
            rnd := random();
            IF rnd < 0.25 THEN
                h_start := lunch_hours[1 + floor(random() * array_length(lunch_hours, 1))::int];
                IF h_start IS NULL THEN h_start := 13; END IF;
            ELSE
                h_start := dinner_hours[1 + floor(random() * array_length(dinner_hours, 1))::int];
                IF h_start IS NULL THEN h_start := 19; END IF;
            END IF;

            -- Минуты: 0, 15, 30, 45
            m_start := (floor(random() * 4)::int) * 15;

            -- Длительность: в основном 2 часа (как BOOKING_DURATION_HOURS)
            rnd := random();
            IF rnd < 0.05 THEN
                dur_minutes := 60;   -- быстрый обед (5%)
            ELSIF rnd < 0.20 THEN
                dur_minutes := 90;   -- короткий (15%)
            ELSIF rnd < 0.65 THEN
                dur_minutes := 120;  -- стандарт = 2ч (45%)
            ELSIF rnd < 0.85 THEN
                dur_minutes := 150;  -- долгий (20%)
            ELSE
                dur_minutes := 180;  -- банкет/праздник (15%)
            END IF;

            ts_start := (d + make_interval(hours := h_start, mins := m_start))::timestamp;
            ts_end := ts_start + (dur_minutes || ' minutes')::interval;

            -- Статусы: прошлые даты — завершены, будущие — подтверждены
            rnd := random();
            IF is_past THEN
                IF rnd < 0.65 THEN res_status := 'finished';
                ELSIF rnd < 0.80 THEN res_status := 'cancelled';
                ELSIF rnd < 0.90 THEN res_status := 'seated';
                ELSE res_status := 'confirmed';
                END IF;
            ELSE
                IF rnd < 0.75 THEN res_status := 'confirmed';
                ELSIF rnd < 0.85 THEN res_status := 'seated';
                ELSIF rnd < 0.95 THEN res_status := 'cancelled';
                ELSE res_status := 'finished';
                END IF;
            END IF;

            res_comment := comments[1 + floor(random() * array_length(comments, 1))::int];

            INSERT INTO reservations (
                id, table_id, guest_id,
                start_time, end_time, people_count,
                status, comment, created_by,
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                table_ids[t_idx],
                guest_ids[g_idx],
                ts_start, ts_end, ppl,
                res_status, res_comment, 'anna_n',
                NOW(), NOW()
            );

            total_created := total_created + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Готово! Создано % бронирований на 17 фев – 17 мар 2026.', total_created;
END $$;
