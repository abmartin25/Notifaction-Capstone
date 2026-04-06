import argparse
import json
import os
import sqlite3
import subprocess
import sys
import time
from copy import deepcopy
from pathlib import Path

#Paths 
ROOT = Path(__file__).parent
DB_PATH = ROOT / "sentinel.db"
SERVER_SCRIPT = ROOT / "server.js"
ELECTRON_MAIN = ROOT / "electron-main.js"


#Default notification state  
# Default notification state (synced with frontend)
DEFAULT_STATE = {
    "title": "",
    "message": "",
    "context": "",
    "userGroup": "",
    "motivation": "risk_avoidance",

    "instructionSteps": False,
    "directAction": False,
    "explainVuln": False,
    "explainRisk": False,
    "contextBackground": False,
    "timeEst": False,
    "transparency": False,
    "consequences": False,
    "supportLinks": False,
    "preferredDecision": False,
    "aiTone": False,

    "urgency": "low",
    "interaction": "click_box",
    "location": "banner",
    "agency": "must_do",

    "schedule": False,
    "deployDate": "",
    "deployHour": "09:00",
    "deployWindow": "",
    "showOnBootup": False,
    "showDuringTask": False,

    # new
    "customSteps": "",
    "customVulnerability": "",
    "customRisk": "",
    "customContext": "",
    "customConsequences": "",
    "customTransparency": "",
    "customLinks": "",
}


#Database layer
class SentinelDB:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS templates (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    name       TEXT    NOT NULL,
                    config     TEXT    NOT NULL,
                    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
                )
            """)
            conn.commit()

    def save(self, name: str, config: dict) -> dict:
        config_json = json.dumps(config)
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id FROM templates WHERE name = ?", (name,)
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE templates SET config = ?, updated_at = datetime('now') WHERE id = ?",
                    (config_json, row[0]),
                )
                conn.commit()
                return self.get(row[0])
            else:
                cur = conn.execute(
                    "INSERT INTO templates (name, config) VALUES (?, ?)",
                    (name, config_json),
                )
                conn.commit()
                return self.get(cur.lastrowid)

    def get(self, id: int) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM templates WHERE id = ?", (id,)
            ).fetchone()
        if not row:
            return None
        cols = ["id", "name", "config", "created_at", "updated_at"]
        result = dict(zip(cols, row))
        result["config"] = json.loads(result["config"])
        return result

    def get_by_name(self, name: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id FROM templates WHERE name = ?", (name,)
            ).fetchone()
        return self.get(row[0]) if row else None

    def list_all(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, created_at, updated_at FROM templates ORDER BY updated_at DESC"
            ).fetchall()
        cols = ["id", "name", "created_at", "updated_at"]
        return [dict(zip(cols, r)) for r in rows]

    def delete(self, id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute("DELETE FROM templates WHERE id = ?", (id,))
            conn.commit()
        return cur.rowcount > 0


# Process launcher
class ProcessManager:
    def __init__(self):
        self._server = None
        self._electron = None

    def start_server(self) -> bool:
        """Start node server.js. Returns True when ready."""
        if not SERVER_SCRIPT.exists():
            print(f"[sentinel] server.js not found at {SERVER_SCRIPT}")
            return False
        print("[sentinel] Starting Node server...")
        self._server = subprocess.Popen(
            ["node", str(SERVER_SCRIPT)],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        # Wait until the server ready
        for _ in range(20):
            line = self._server.stdout.readline()
            if "running at" in line.lower():
                print(f"[sentinel] {line.strip()}")
                return True
            time.sleep(0.1)
        return True  # assume ready after timeout

    def start_electron(self) -> bool:
        """Launch the Electron desktop app."""
        print("[sentinel] Launching Electron app...")
        try:
            self._electron = subprocess.Popen(
            ["npx", "electron", str(ELECTRON_MAIN)],
            cwd=str(ROOT),
            shell=True  # Windows
        )
            return True
        except FileNotFoundError:
            print("[sentinel] Electron not found. Run `npm install` first.")
            return False

    def stop_all(self):
        for proc in [self._server, self._electron]:
            if proc and proc.poll() is None:
                proc.terminate()


# Main SDK class 
class SentinelSDK:

    def __init__(self, db_path: Path = DB_PATH):
        self.db = SentinelDB(db_path)

    #Notification building 

    def get_default_state(self) -> dict:
        """Return a fresh copy of the default notification state."""
        return deepcopy(DEFAULT_STATE)

    def create_notification(self, **kwargs) -> dict:
        """
        Build a notification config by starting from the default state
        and applying any keyword overrides.

        All keys from DEFAULT_STATE are valid kwargs, e.g.:
            create_notification(
                title="Update your password",
                urgency="high",
                consequences=True,
                customSteps="Open settings\nChange password\nSave changes",
                customTransparency="Why you are seeing this: your password was flagged as weak."
             )
        """
        state = self.get_default_state()
        invalid = [k for k in kwargs if k not in DEFAULT_STATE]
        if invalid:
            print(f"[sentinel] Warning: unknown fields ignored: {invalid}")
        state.update({k: v for k, v in kwargs.items() if k in DEFAULT_STATE})
        return state

    def modify_notification(self, notification: dict, **kwargs) -> dict:
        """Apply changes to an existing notification config."""
        updated = deepcopy(notification)
        updated.update(kwargs)
        return updated

    # Database ops

    def save_notification(self, name: str, config: dict) -> dict:
        """Save (or overwrite) a notification template by name."""
        result = self.db.save(name, config)
        print(f"[sentinel] Saved template '{name}' (id={result['id']})")
        return result

    def load_notification(self, name: str) -> dict | None:
        """Load a notification template by name. Returns config dict or None."""
        result = self.db.get_by_name(name)
        if result:
            print(f"[sentinel] Loaded template '{name}'")
            return result["config"]
        print(f"[sentinel] Template '{name}' not found.")
        return None

    def list_notifications(self) -> list[dict]:
        """List all saved templates (id, name, timestamps)."""
        return self.db.list_all()

    def delete_notification(self, name: str) -> bool:
        """Delete a template by name."""
        row = self.db.get_by_name(name)
        if not row:
            print(f"[sentinel] Template '{name}' not found.")
            return False
        return self.db.delete(row["id"])

    # Display / export 

    def print_notification(self, config: dict):
        """Pretty-print a notification config to the console."""
        print("\n── Notification Config ──────────────────")
        for k, v in config.items():
            print(f"  {k:<22} {v}")
        print("─────────────────────────────────────────\n")

    def show_db(self):
        """Print all saved templates to the console."""
        templates = self.list_notifications()
        if not templates:
            print("[sentinel] No saved templates.")
            return
        print(f"\n── Saved Templates ({len(templates)}) ──────────────")
        for t in templates:
            print(f"  [{t['id']}] {t['name']:<30} updated {t['updated_at']}")
        print("─────────────────────────────────────────\n")

    def export_python_snippet(self, config: dict) -> str:
        """Generate the Python SDK call that would recreate this config."""
        lines = ["notif = sdk.create_notification("]
        for k, v in config.items():
            lines.append(f"    {k}={repr(v)},")
        lines.append(")")
        return "\n".join(lines)


# CLI entry point 
def main():
    parser = argparse.ArgumentParser(
        description="SENTINEL SDK"
    )
    parser.add_argument(
        "--debug", action="store_true",
        help="Start Node server only — open http://localhost:3000 in your browser"
    )
    args = parser.parse_args()

    pm = ProcessManager()
    sdk = SentinelSDK()

    # Launch modes
    if args.debug:
        # Dev/team only — server without Electron, use the browser
        pm.start_server()
        print("[sentinel] Debug server running at http://localhost:3000")
        print("[sentinel] Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pm.stop_all()

    else:
        # Default — launch the Electron app
        pm.start_server()
        time.sleep(0.5)
        ok = pm.start_electron()
        if ok:
            print("[sentinel] App launched. Close the window to exit.")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pm.stop_all()


if __name__ == "__main__":
    main()