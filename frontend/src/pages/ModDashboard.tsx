
import { useState } from 'react';

const mockStats = [
  { label: 'Total posts', value: 1248 },
  { label: 'Active threads', value: 86 },
  { label: 'Reports', value: 12 },
  { label: 'Banned users', value: 7 },
];

const mockReports = [
  { id: 1, board: '/b/', postId: 1024, reason: 'Spam', status: 'Pending' },
  { id: 2, board: '/tech/', postId: 1031, reason: 'Off-topic', status: 'Pending' },
  { id: 3, board: '/b/', postId: 1045, reason: 'Inappropriate content', status: 'Pending' },
];

function ModDashboard() {
  const [reports, setReports] = useState(mockReports);

  const dismissReport = (id: number) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
  };

  return (
    <main className="mod-dashboard">
      <header className="mod-dashboard-header">
        <div>
          <p className="mod-dashboard-eyebrow">Imageboard / Staff</p>
          <h1>Moderator Dashboard</h1>
          <p>Manage reports and moderate your boards.</p>
        </div>

        <nav className="mod-dashboard-nav">
          <a href="/">Back to imageboard</a>
          <button type="button" disabled>
            Log out
          </button>
        </nav>
      </header>

      <section className="mod-dashboard-stats" aria-label="Board statistics">
        {mockStats.map((stat) => (
          <article className="mod-stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="mod-dashboard-reports">
        <div className="mod-section-header">
          <div>
            <h2>Recent reports</h2>
            <p>Review reported posts from your boards.</p>
          </div>

          <span>{reports.length} pending</span>
        </div>

        {reports.length === 0 ? (
          <p className="mod-empty-state">No pending reports.</p>
        ) : (
          <div className="mod-reports-list">
            {reports.map((report) => (
              <article className="mod-report-card" key={report.id}>
                <div className="mod-report-info">
                  <strong>
                    {report.board} — Post #{report.postId}
                  </strong>
                  <p>Reason: {report.reason}</p>
                  <span>{report.status}</span>
                </div>

                <div className="mod-report-actions">
                  <button
                    type="button"
                    onClick={() => dismissReport(report.id)}
                  >
                    Dismiss
                  </button>
                  <button type="button" disabled>
                    Delete post
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="mod-dashboard-footer">
        <p>Imageboard moderation panel · Demo data</p>
      </footer>
    </main>
  );
}

export default ModDashboard;
