use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// ── Structs ───────────────────────────────────────────────────────────────

#[derive(serde::Serialize, FromRow, Clone)]
pub struct Task {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow, Clone)]
pub struct MoodEntry {
    pub id: Uuid,
    pub user_id: Uuid,
    pub mood_level: i32,
    pub mood_type: Option<String>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow, Clone)]
pub struct FocusSession {
    pub id: Uuid,
    pub user_id: Uuid,
    pub activity: String,
    pub duration_minutes: i32,
    pub notes: Option<String>,
    pub started_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow, Clone)]
pub struct JournalEntry {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub content: String,
    pub mood: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow, Clone)]
pub struct Routine {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub completed: bool,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow, Clone)]
pub struct MeditationSession {
    pub id: Uuid,
    pub user_id: Uuid,
    pub meditation_type: String,
    pub duration_minutes: i32,
    pub notes: Option<String>,
    pub started_at: DateTime<Utc>,
}

// Unified activity for the recent feed
#[derive(serde::Serialize)]
pub struct ActivityItem {
    pub activity_type: String,
    pub title: String,
    pub time: String,
    pub date: String,
    pub dot_color: String,
}

// ── Table Creation ────────────────────────────────────────────────────────

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Tasks
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_tasks (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id      UUID REFERENCES app_users(id) ON DELETE CASCADE,
            title        VARCHAR(200) NOT NULL,
            description  TEXT,
            completed    BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMPTZ,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    // Mood check-ins
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_moods (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id    UUID REFERENCES app_users(id) ON DELETE CASCADE,
            mood_level INT NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
            mood_type  VARCHAR(50),
            notes      TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    // Focus sessions
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_focus_sessions (
            id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id          UUID REFERENCES app_users(id) ON DELETE CASCADE,
            activity         VARCHAR(200) NOT NULL,
            duration_minutes INT NOT NULL,
            notes            TEXT,
            started_at       TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    // Journal entries
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_journals (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id    UUID REFERENCES app_users(id) ON DELETE CASCADE,
            title      VARCHAR(200) NOT NULL,
            content    TEXT NOT NULL,
            mood       VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    // Routines
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_routines (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id      UUID REFERENCES app_users(id) ON DELETE CASCADE,
            name         VARCHAR(200) NOT NULL,
            description  TEXT,
            completed    BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMPTZ,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    // Meditation sessions
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_meditations (
            id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id          UUID REFERENCES app_users(id) ON DELETE CASCADE,
            meditation_type  VARCHAR(100) NOT NULL,
            duration_minutes INT NOT NULL,
            notes            TEXT,
            started_at       TIMESTAMPTZ DEFAULT NOW()
        )"
    ).execute(pool).await?;

    Ok(())
}

// ── Tasks ─────────────────────────────────────────────────────────────────

pub async fn create_task(pool: &PgPool, user_id: Uuid, title: &str, description: Option<&str>, completed: bool) -> Result<Task, sqlx::Error> {
    let completed_at: Option<DateTime<Utc>> = if completed { Some(Utc::now()) } else { None };
    let row = sqlx::query_as::<_, Task>(
        "INSERT INTO nm_tasks (user_id, title, description, completed, completed_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *"
    )
    .bind(user_id)
    .bind(title)
    .bind(description)
    .bind(completed)
    .bind(completed_at)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_tasks(pool: &PgPool, user_id: Uuid) -> Result<Vec<Task>, sqlx::Error> {
    let rows = sqlx::query_as::<_, Task>(
        "SELECT * FROM nm_tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn update_task(pool: &PgPool, id: Uuid, user_id: Uuid, completed: bool) -> Result<(), sqlx::Error> {
    let completed_at: Option<DateTime<Utc>> = if completed { Some(Utc::now()) } else { None };
    sqlx::query(
        "UPDATE nm_tasks SET completed = $1, completed_at = $2 WHERE id = $3 AND user_id = $4"
    )
    .bind(completed)
    .bind(completed_at)
    .bind(id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn delete_task(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_tasks WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Moods ─────────────────────────────────────────────────────────────────

pub async fn create_mood(pool: &PgPool, user_id: Uuid, mood_level: i32, mood_type: Option<&str>, notes: Option<&str>) -> Result<MoodEntry, sqlx::Error> {
    let row = sqlx::query_as::<_, MoodEntry>(
        "INSERT INTO nm_moods (user_id, mood_level, mood_type, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(user_id)
    .bind(mood_level)
    .bind(mood_type)
    .bind(notes)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_moods(pool: &PgPool, user_id: Uuid) -> Result<Vec<MoodEntry>, sqlx::Error> {
    let rows = sqlx::query_as::<_, MoodEntry>(
        "SELECT * FROM nm_moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn delete_mood(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_moods WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Focus Sessions ────────────────────────────────────────────────────────

pub async fn create_focus_session(pool: &PgPool, user_id: Uuid, activity: &str, duration_minutes: i32, notes: Option<&str>) -> Result<FocusSession, sqlx::Error> {
    let row = sqlx::query_as::<_, FocusSession>(
        "INSERT INTO nm_focus_sessions (user_id, activity, duration_minutes, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(user_id)
    .bind(activity)
    .bind(duration_minutes)
    .bind(notes)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_focus_sessions(pool: &PgPool, user_id: Uuid) -> Result<Vec<FocusSession>, sqlx::Error> {
    let rows = sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM nm_focus_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn delete_focus_session(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_focus_sessions WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Journals ──────────────────────────────────────────────────────────────

pub async fn create_journal(pool: &PgPool, user_id: Uuid, title: &str, content: &str, mood: Option<&str>) -> Result<JournalEntry, sqlx::Error> {
    let row = sqlx::query_as::<_, JournalEntry>(
        "INSERT INTO nm_journals (user_id, title, content, mood)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(user_id)
    .bind(title)
    .bind(content)
    .bind(mood)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_journals(pool: &PgPool, user_id: Uuid) -> Result<Vec<JournalEntry>, sqlx::Error> {
    let rows = sqlx::query_as::<_, JournalEntry>(
        "SELECT * FROM nm_journals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn delete_journal(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_journals WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Routines ──────────────────────────────────────────────────────────────

pub async fn create_routine(pool: &PgPool, user_id: Uuid, name: &str, description: Option<&str>, completed: bool) -> Result<Routine, sqlx::Error> {
    let completed_at: Option<DateTime<Utc>> = if completed { Some(Utc::now()) } else { None };
    let row = sqlx::query_as::<_, Routine>(
        "INSERT INTO nm_routines (user_id, name, description, completed, completed_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *"
    )
    .bind(user_id)
    .bind(name)
    .bind(description)
    .bind(completed)
    .bind(completed_at)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_routines(pool: &PgPool, user_id: Uuid) -> Result<Vec<Routine>, sqlx::Error> {
    let rows = sqlx::query_as::<_, Routine>(
        "SELECT * FROM nm_routines WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn update_routine(pool: &PgPool, id: Uuid, user_id: Uuid, completed: bool) -> Result<(), sqlx::Error> {
    let completed_at: Option<DateTime<Utc>> = if completed { Some(Utc::now()) } else { None };
    sqlx::query(
        "UPDATE nm_routines SET completed = $1, completed_at = $2 WHERE id = $3 AND user_id = $4"
    )
    .bind(completed)
    .bind(completed_at)
    .bind(id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn delete_routine(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_routines WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Meditations ───────────────────────────────────────────────────────────

pub async fn create_meditation(pool: &PgPool, user_id: Uuid, meditation_type: &str, duration_minutes: i32, notes: Option<&str>) -> Result<MeditationSession, sqlx::Error> {
    let row = sqlx::query_as::<_, MeditationSession>(
        "INSERT INTO nm_meditations (user_id, meditation_type, duration_minutes, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *"
    )
    .bind(user_id)
    .bind(meditation_type)
    .bind(duration_minutes)
    .bind(notes)
    .fetch_one(pool)
    .await?;
    Ok(row)
}

pub async fn get_meditations(pool: &PgPool, user_id: Uuid) -> Result<Vec<MeditationSession>, sqlx::Error> {
    let rows = sqlx::query_as::<_, MeditationSession>(
        "SELECT * FROM nm_meditations WHERE user_id = $1 ORDER BY started_at DESC LIMIT 100"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn delete_meditation(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM nm_meditations WHERE id = $1 AND user_id = $2")
        .bind(id).bind(user_id).execute(pool).await?;
    Ok(())
}

// ── Aggregated recent activity feed ──────────────────────────────────────

pub async fn get_recent_activities(pool: &PgPool, user_id: Uuid, limit: i64) -> Result<Vec<ActivityItem>, sqlx::Error> {
    let mut items: Vec<(DateTime<Utc>, ActivityItem)> = Vec::new();

    // Tasks (completed only)
    let tasks = sqlx::query_as::<_, Task>(
        "SELECT * FROM nm_tasks WHERE user_id = $1 AND completed = TRUE ORDER BY completed_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    for t in tasks {
        let ts = t.completed_at.unwrap_or(t.created_at);
        items.push((ts, ActivityItem {
            activity_type: "task".into(),
            title: t.title.clone(),
            time: format_time(ts),
            date: ts.format("%Y-%m-%d").to_string(),
            dot_color: "#22c55e".into(),
        }));
    }

    // Moods
    let moods = sqlx::query_as::<_, MoodEntry>(
        "SELECT * FROM nm_moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    let mood_labels = ["😢 Very Sad", "😕 Sad", "😐 Neutral", "😊 Happy", "😄 Very Happy"];
    for m in moods {
        let label = mood_labels.get((m.mood_level - 1).max(0) as usize).unwrap_or(&"Unknown");
        items.push((m.created_at, ActivityItem {
            activity_type: "mood".into(),
            title: format!("Mood: {}", label),
            time: format_time(m.created_at),
            date: m.created_at.format("%Y-%m-%d").to_string(),
            dot_color: "#f472b6".into(),
        }));
    }

    // Focus sessions
    let focus = sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM nm_focus_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    for f in focus {
        items.push((f.started_at, ActivityItem {
            activity_type: "focus".into(),
            title: format!("Focus: {} ({}m)", f.activity, f.duration_minutes),
            time: format_time(f.started_at),
            date: f.started_at.format("%Y-%m-%d").to_string(),
            dot_color: "#60a5fa".into(),
        }));
    }

    // Journals
    let journals = sqlx::query_as::<_, JournalEntry>(
        "SELECT * FROM nm_journals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    for j in journals {
        items.push((j.created_at, ActivityItem {
            activity_type: "journal".into(),
            title: j.title.clone(),
            time: format_time(j.created_at),
            date: j.created_at.format("%Y-%m-%d").to_string(),
            dot_color: "#a78bfa".into(),
        }));
    }

    // Routines (completed only)
    let routines = sqlx::query_as::<_, Routine>(
        "SELECT * FROM nm_routines WHERE user_id = $1 AND completed = TRUE ORDER BY completed_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    for r in routines {
        let ts = r.completed_at.unwrap_or(r.created_at);
        items.push((ts, ActivityItem {
            activity_type: "routine".into(),
            title: r.name.clone(),
            time: format_time(ts),
            date: ts.format("%Y-%m-%d").to_string(),
            dot_color: "#fb923c".into(),
        }));
    }

    // Meditations
    let meds = sqlx::query_as::<_, MeditationSession>(
        "SELECT * FROM nm_meditations WHERE user_id = $1 ORDER BY started_at DESC LIMIT 20"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    for med in meds {
        items.push((med.started_at, ActivityItem {
            activity_type: "meditation".into(),
            title: format!("{} meditation ({}m)", med.meditation_type, med.duration_minutes),
            time: format_time(med.started_at),
            date: med.started_at.format("%Y-%m-%d").to_string(),
            dot_color: "#34d399".into(),
        }));
    }

    // Sort by date desc and take top N
    items.sort_by(|a, b| b.0.cmp(&a.0));
    Ok(items.into_iter().take(limit as usize).map(|(_, item)| item).collect())
}

// ── Heatmap data ──────────────────────────────────────────────────────────

#[derive(serde::Serialize)]
pub struct HeatmapDay {
    pub date: String,  // "YYYY-MM-DD"
    pub count: i64,
}

pub async fn get_heatmap(pool: &PgPool, user_id: Uuid, year: i32) -> Result<Vec<HeatmapDay>, sqlx::Error> {
    // Union all 6 tables and count per day
    let rows: Vec<(String, i64)> = sqlx::query_as(
        r#"
        SELECT date_trunc('day', ts)::date::text as day, COUNT(*) as cnt
        FROM (
            SELECT created_at as ts FROM nm_tasks       WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND completed = TRUE
            UNION ALL
            SELECT created_at as ts FROM nm_moods       WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
            UNION ALL
            SELECT started_at as ts FROM nm_focus_sessions WHERE user_id = $1 AND EXTRACT(YEAR FROM started_at) = $2
            UNION ALL
            SELECT created_at as ts FROM nm_journals    WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
            UNION ALL
            SELECT created_at as ts FROM nm_routines    WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND completed = TRUE
            UNION ALL
            SELECT started_at as ts FROM nm_meditations WHERE user_id = $1 AND EXTRACT(YEAR FROM started_at) = $2
        ) sub
        GROUP BY day
        ORDER BY day
        "#
    )
    .bind(user_id)
    .bind(year as i64)
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(|(date, count)| HeatmapDay { date, count }).collect())
}

// ── Stats snapshot ────────────────────────────────────────────────────────

#[derive(serde::Serialize)]
pub struct DashboardStats {
    pub tasks_today: i64,
    pub tasks_total_today: i64,
    pub latest_mood_level: Option<i32>,
    pub latest_mood_type: Option<String>,
    pub focus_minutes_today: i64,
    pub streak_days: i64,
}

pub async fn get_dashboard_stats(pool: &PgPool, user_id: Uuid) -> Result<DashboardStats, sqlx::Error> {
    let today = Utc::now().format("%Y-%m-%d").to_string();

    let tasks_completed: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nm_tasks WHERE user_id = $1 AND completed = TRUE AND DATE(completed_at) = $2::date"
    ).bind(user_id).bind(&today).fetch_one(pool).await.unwrap_or(0);

    let tasks_total: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nm_tasks WHERE user_id = $1 AND DATE(created_at) = $2::date"
    ).bind(user_id).bind(&today).fetch_one(pool).await.unwrap_or(0);

    let mood_row: Option<(i32, Option<String>)> = sqlx::query_as(
        "SELECT mood_level, mood_type FROM nm_moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1"
    ).bind(user_id).fetch_optional(pool).await.unwrap_or(None);

    let focus_today: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(duration_minutes), 0) FROM nm_focus_sessions WHERE user_id = $1 AND DATE(started_at) = $2::date"
    ).bind(user_id).bind(&today).fetch_one(pool).await.unwrap_or(0);

    // Streak: count consecutive days with any activity
    let streak: i64 = sqlx::query_scalar(
        r#"
        WITH active_days AS (
            SELECT DISTINCT DATE(ts) as day FROM (
                SELECT completed_at as ts FROM nm_tasks WHERE user_id = $1 AND completed = TRUE
                UNION ALL SELECT created_at FROM nm_moods WHERE user_id = $1
                UNION ALL SELECT started_at FROM nm_focus_sessions WHERE user_id = $1
                UNION ALL SELECT created_at FROM nm_journals WHERE user_id = $1
                UNION ALL SELECT completed_at FROM nm_routines WHERE user_id = $1 AND completed = TRUE
                UNION ALL SELECT started_at FROM nm_meditations WHERE user_id = $1
            ) sub
        ),
        numbered AS (
            SELECT day, ROW_NUMBER() OVER (ORDER BY day DESC) as rn FROM active_days
        )
        SELECT COUNT(*) FROM numbered
        WHERE (CURRENT_DATE - day) = (rn - 1)
        "#
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);

    Ok(DashboardStats {
        tasks_today: tasks_completed,
        tasks_total_today: tasks_total,
        latest_mood_level: mood_row.as_ref().map(|r| r.0),
        latest_mood_type: mood_row.and_then(|r| r.1),
        focus_minutes_today: focus_today,
        streak_days: streak,
    })
}

// ── Helpers ───────────────────────────────────────────────────────────────

fn format_time(dt: DateTime<Utc>) -> String {
    let local = dt.with_timezone(&chrono::Local);
    let now = chrono::Local::now();
    let diff = now.signed_duration_since(local);
    let mins = diff.num_minutes();
    if mins < 1 { return "Just now".into(); }
    if mins < 60 { return format!("{} min ago", mins); }
    let hours = diff.num_hours();
    if hours < 24 { return format!("{} hour{} ago", hours, if hours == 1 { "" } else { "s" }); }
    let days = diff.num_days();
    if days == 1 { return "Yesterday".into(); }
    if days < 7 { return format!("{} days ago", days); }
    local.format("%b %d").to_string()
}

// ── Dashboard Advanced Analytics ──────────────────────────────────────────

#[derive(serde::Serialize)]
pub struct ProductivityDay {
    pub day: String,
    pub completed: i64,
    pub pending: i64,
    pub score: f64,
}

pub async fn get_productivity_analytics(pool: &PgPool, user_id: Uuid, range_days: i32) -> Result<Vec<ProductivityDay>, sqlx::Error> {
    let query = r#"
        WITH dates AS (
            SELECT generate_series(CURRENT_DATE - ($2 - 1) * INTERVAL '1 day', CURRENT_DATE, '1 day')::date AS d
        ),
        daily_tasks AS (
            SELECT 
                d.d as day_date,
                COUNT(t.id) FILTER (WHERE t.completed = TRUE AND DATE(COALESCE(t.completed_at, t.created_at)) = d.d) as completed_tasks,
                COUNT(t.id) FILTER (WHERE t.completed = FALSE AND DATE(t.created_at) = d.d) as pending_tasks,
                COUNT(t.id) FILTER (WHERE DATE(COALESCE(t.completed_at, t.created_at)) = d.d) as total_tasks
            FROM dates d
            LEFT JOIN nm_tasks t ON t.user_id = $1 AND DATE(COALESCE(t.completed_at, t.created_at)) = d.d
            GROUP BY d.d
        ),
        daily_moods AS (
            SELECT DATE(created_at) as day_date, AVG(mood_level) as avg_mood
            FROM nm_moods
            WHERE user_id = $1 AND created_at >= CURRENT_DATE - ($2 - 1) * INTERVAL '1 day'
            GROUP BY DATE(created_at)
        ),
        daily_focus AS (
            SELECT DATE(started_at) as day_date, SUM(duration_minutes) as focus_minutes
            FROM nm_focus_sessions
            WHERE user_id = $1 AND started_at >= CURRENT_DATE - ($2 - 1) * INTERVAL '1 day'
            GROUP BY DATE(started_at)
        )
        SELECT 
            to_char(dt.day_date, 'Dy') as day_name,
            COALESCE(dt.completed_tasks, 0) as completed,
            COALESCE(dt.pending_tasks, 0) as pending,
            COALESCE(dt.total_tasks, 0) as total,
            COALESCE(dm.avg_mood, 0) as avg_mood,
            COALESCE(df.focus_minutes, 0) as focus_minutes
        FROM daily_tasks dt
        LEFT JOIN daily_moods dm ON dt.day_date = dm.day_date
        LEFT JOIN daily_focus df ON dt.day_date = df.day_date
        ORDER BY dt.day_date ASC
    "#;

    let rows: Vec<(String, i64, i64, i64, f64, i64)> = sqlx::query_as(query)
        .bind(user_id)
        .bind(range_days)
        .fetch_all(pool)
        .await?;

    let mut result = Vec::new();
    for (day, completed, pending, total, avg_mood, focus_minutes) in rows {
        let base_score = if total > 0 { (completed as f64 / total as f64) * 50.0 } else { 0.0 };
        let mood_multiplier = if avg_mood > 0.0 { (avg_mood / 5.0) * 30.0 } else { 0.0 };
        let focus_bonus = ((focus_minutes as f64 / 480.0) * 20.0).min(20.0);
        let score = (base_score + mood_multiplier + focus_bonus).clamp(0.0, 100.0);

        result.push(ProductivityDay {
            day,
            completed,
            pending,
            score,
        });
    }

    Ok(result)
}

#[derive(serde::Serialize)]
pub struct MoodDay {
    pub day: String,
    pub mood: f64,
}

pub async fn get_mood_analytics(pool: &PgPool, user_id: Uuid, range_days: i32) -> Result<Vec<MoodDay>, sqlx::Error> {
    let query = r#"
        WITH dates AS (
            SELECT generate_series(CURRENT_DATE - ($2 - 1) * INTERVAL '1 day', CURRENT_DATE, '1 day')::date AS d
        )
        SELECT 
            to_char(d.d, 'Dy') as day_name,
            COALESCE(AVG(m.mood_level), 0) as mood
        FROM dates d
        LEFT JOIN nm_moods m ON m.user_id = $1 AND DATE(m.created_at) = d.d
        GROUP BY d.d
        ORDER BY d.d ASC
    "#;

    let rows: Vec<(String, f64)> = sqlx::query_as(query)
        .bind(user_id)
        .bind(range_days)
        .fetch_all(pool)
        .await?;

    Ok(rows.into_iter().map(|(day, mood)| MoodDay { day, mood }).collect())
}

#[derive(serde::Serialize)]
pub struct WorkCategory {
    pub name: String,
    pub value: i64,
    pub color: String,
}

pub async fn get_work_distribution(pool: &PgPool, user_id: Uuid) -> Result<Vec<WorkCategory>, sqlx::Error> {
    let query = r#"
        SELECT activity as name, SUM(duration_minutes)::bigint as value
        FROM nm_focus_sessions
        WHERE user_id = $1 AND started_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY activity
        ORDER BY value DESC
        LIMIT 5
    "#;

    let rows: Vec<(String, i64)> = sqlx::query_as(query)
        .bind(user_id)
        .fetch_all(pool)
        .await?;

    let colors = vec![
        "hsl(258 100% 83%)", // PURPLE_LIGHT
        "hsl(258 100% 65%)", // PURPLE
        "hsl(181 84% 66%)",  // CYAN_LIGHT
        "hsl(181 84% 45%)",  // CYAN
        "#f472b6",           // PINK
    ];

    let mut result = Vec::new();
    for (i, (name, value)) in rows.into_iter().enumerate() {
        let color = colors.get(i % colors.len()).unwrap_or(&"#94a3b8").to_string();
        result.push(WorkCategory { name, value, color });
    }

    Ok(result)
}

#[derive(serde::Serialize)]
pub struct Insight {
    pub emoji: String,
    pub label: String,
    pub text: String,
    pub color: String,
}

#[derive(serde::Serialize)]
pub struct HabitMetrics {
    pub task_streak: i64,
    pub weekly_consistency: i64,
    pub focus_sessions_week: i64,
    pub wellness_score: i64,
    pub dynamic_insights: Vec<Insight>,
}

pub async fn get_habit_metrics(pool: &PgPool, user_id: Uuid) -> Result<HabitMetrics, sqlx::Error> {
    let streak: i64 = sqlx::query_scalar(
        r#"
        WITH active_days AS (
            SELECT DISTINCT DATE(ts) as day FROM (
                SELECT completed_at as ts FROM nm_tasks WHERE user_id = $1 AND completed = TRUE
                UNION ALL SELECT created_at FROM nm_moods WHERE user_id = $1
                UNION ALL SELECT started_at FROM nm_focus_sessions WHERE user_id = $1
                UNION ALL SELECT created_at FROM nm_journals WHERE user_id = $1
                UNION ALL SELECT completed_at FROM nm_routines WHERE user_id = $1 AND completed = TRUE
                UNION ALL SELECT started_at FROM nm_meditations WHERE user_id = $1
            ) sub
        ),
        numbered AS (
            SELECT day, ROW_NUMBER() OVER (ORDER BY day DESC) as rn FROM active_days
        )
        SELECT COUNT(*) FROM numbered
        WHERE (CURRENT_DATE - day) = (rn - 1)
        "#
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);

    let active_days_last_7: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(DISTINCT DATE(ts)) FROM (
            SELECT completed_at as ts FROM nm_tasks WHERE user_id = $1 AND completed = TRUE
            UNION ALL SELECT created_at FROM nm_moods WHERE user_id = $1
            UNION ALL SELECT started_at FROM nm_focus_sessions WHERE user_id = $1
            UNION ALL SELECT created_at FROM nm_journals WHERE user_id = $1
            UNION ALL SELECT completed_at FROM nm_routines WHERE user_id = $1 AND completed = TRUE
            UNION ALL SELECT started_at FROM nm_meditations WHERE user_id = $1
        ) sub
        WHERE ts >= CURRENT_DATE - INTERVAL '7 days'
        "#
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);
    let weekly_consistency = (active_days_last_7 as f64 / 7.0 * 100.0) as i64;

    let focus_sessions_week: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nm_focus_sessions WHERE user_id = $1 AND started_at >= CURRENT_DATE - INTERVAL '7 days'"
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);

    let avg_mood_week: f64 = sqlx::query_scalar(
        "SELECT COALESCE(AVG(mood_level), 0) FROM nm_moods WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'"
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0.0);
    
    let meditation_mins_week: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(duration_minutes), 0)::bigint FROM nm_meditations WHERE user_id = $1 AND started_at >= CURRENT_DATE - INTERVAL '7 days'"
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);

    let journals_week: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM nm_journals WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'"
    ).bind(user_id).fetch_one(pool).await.unwrap_or(0);

    let mood_score = (avg_mood_week / 5.0) * 50.0;
    let med_score = ((meditation_mins_week as f64) / 60.0 * 30.0).min(30.0);
    let journal_score = ((journals_week as f64) / 3.0 * 20.0).min(20.0);
    let wellness_score = (mood_score + med_score + journal_score) as i64;

    let mut dynamic_insights = Vec::new();

    let correlation_query = r#"
        WITH daily_tasks AS (
            SELECT DATE(COALESCE(completed_at, created_at)) as d, COUNT(*) as c
            FROM nm_tasks WHERE user_id = $1 AND completed = TRUE
            GROUP BY DATE(COALESCE(completed_at, created_at))
        ), daily_moods AS (
            SELECT DATE(created_at) as d, AVG(mood_level) as m
            FROM nm_moods WHERE user_id = $1
            GROUP BY DATE(created_at)
        )
        SELECT t.c, m.m
        FROM daily_tasks t
        JOIN daily_moods m ON t.d = m.d
        WHERE t.d >= CURRENT_DATE - INTERVAL '30 days'
    "#;
    let corr_rows: Vec<(i64, f64)> = sqlx::query_as(correlation_query).bind(user_id).fetch_all(pool).await.unwrap_or_default();

    if corr_rows.len() > 1 {
        let n = corr_rows.len() as f64;
        let mut sum_m = 0.0;
        let mut sum_c = 0.0;
        let mut high_mood_prod = Vec::new();
        let mut low_mood_prod = Vec::new();

        for (c, m) in &corr_rows {
            sum_c += *c as f64;
            sum_m += *m;
            if *m >= 4.0 { high_mood_prod.push(*c as f64); }
            if *m <= 2.0 { low_mood_prod.push(*c as f64); }
        }
        let mean_m = sum_m / n;
        let mean_c = sum_c / n;

        let mut num = 0.0;
        let mut den_m = 0.0;
        let mut den_c = 0.0;
        for (c, m) in &corr_rows {
            let c_diff = *c as f64 - mean_c;
            let m_diff = *m - mean_m;
            num += c_diff * m_diff;
            den_c += c_diff * c_diff;
            den_m += m_diff * m_diff;
        }

        if den_m > 0.0 && den_c > 0.0 {
            let correlation = num / (den_m * den_c).sqrt();
            if correlation > 0.5 {
                dynamic_insights.push(Insight {
                    emoji: "📊".into(),
                    label: "Mood & Productivity".into(),
                    text: "Strong positive correlation! You tend to complete more tasks when you're in a good mood.".into(),
                    color: "border-l-blue-400 bg-blue-50".into(),
                });
            }
        }

        let avg_high = if !high_mood_prod.is_empty() { high_mood_prod.iter().sum::<f64>() / high_mood_prod.len() as f64 } else { 0.0 };
        let avg_low = if !low_mood_prod.is_empty() { low_mood_prod.iter().sum::<f64>() / low_mood_prod.len() as f64 } else { 0.0 };

        if avg_high > avg_low + 2.0 {
            dynamic_insights.push(Insight {
                emoji: "💡".into(),
                label: "Peak Performance".into(),
                text: "Your productivity is significantly higher on high-mood days. Prioritize activities that make you happy!".into(),
                color: "border-l-[hsl(258_100%_65%)] bg-[hsl(258_100%_65%_/_0.05)]".into(),
            });
        }
    }

    if streak >= 3 {
        dynamic_insights.push(Insight {
            emoji: "🎯".into(),
            label: "Consistency Win".into(),
            text: format!("You've maintained a {}-day streak! Keep this momentum to build lasting habits.", streak),
            color: "border-l-pink-400 bg-pink-50".into(),
        });
    }

    let recent_moods: Vec<f64> = sqlx::query_scalar(
        "SELECT mood_level::float FROM nm_moods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3"
    ).bind(user_id).fetch_all(pool).await.unwrap_or_default();

    if recent_moods.len() == 3 && recent_moods.iter().all(|&m| m <= 2.0) {
        dynamic_insights.push(Insight {
            emoji: "🫂".into(),
            label: "Gentle Reminder".into(),
            text: "I noticed you've been feeling low lately. It's perfectly okay to take a break or reach out to someone you trust.".into(),
            color: "border-l-orange-400 bg-orange-50".into(),
        });
    }

    if dynamic_insights.is_empty() {
        dynamic_insights.push(Insight {
            emoji: "✨".into(),
            label: "Ready to go".into(),
            text: "Keep logging your tasks and moods to generate personalized AI insights!".into(),
            color: "border-l-[hsl(181_84%_45%)] bg-[hsl(181_84%_45%_/_0.05)]".into(),
        });
    }

    Ok(HabitMetrics {
        task_streak: streak,
        weekly_consistency,
        focus_sessions_week,
        wellness_score,
        dynamic_insights,
    })
}
