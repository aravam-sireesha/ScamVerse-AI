
import os
import sys
import subprocess
import time
import signal

def print_banner():
    print("""
======================================================================
  🛡️  AI SCAMSHIELD ENTERPRISE PLATFORM RUNNER
======================================================================
    Frontend Client : http://localhost:5173
    Backend Swagger : http://localhost:8000/docs
    API Gateway     : http://localhost:8000/api/v1
======================================================================
    """)

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    backend_dir = os.path.join(root_dir, "backend")

    print_banner()
    print("[*] Starting backend FastAPI service...")
    
    # Start Backend
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    print("[*] Starting frontend React+Vite service...")
    
    # Start Frontend (uses npm run dev)
    # On Windows, shell=True is needed to run batch files like npm
    use_shell = os.name == 'nt'
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=use_shell,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    processes = [
        ("Backend", backend_process),
        ("Frontend", frontend_process)
    ]

    print("[+] Services launched. Press Ctrl+C to terminate all services.")
    print("----------------------------------------------------------------------")

    # Flag to keep reading logs
    try:
        # Non-blocking check for logs
        import threading
        
        def log_reader(name, process):
            for line in iter(process.stdout.readline, ''):
                print(f"[{name}] {line.strip()}")
            process.stdout.close()

        # Start background threads to print logs
        t1 = threading.Thread(target=log_reader, args=("Backend", backend_process), daemon=True)
        t2 = threading.Thread(target=log_reader, args=("Frontend", frontend_process), daemon=True)
        t1.start()
        t2.start()

        # Keep main thread alive
        while True:
            time.sleep(1)
            # Check if any process died
            if backend_process.poll() is not None:
                print(f"[!] Backend stopped with code {backend_process.poll()}")
                break
            if frontend_process.poll() is not None:
                print(f"[!] Frontend stopped with code {frontend_process.poll()}")
                break

    except KeyboardInterrupt:
        print("\n[*] Terminating all ScamShield services...")
    finally:
        # Graceful shutdown of children
        for name, proc in processes:
            try:
                if os.name == 'nt':
                    # On Windows, taskkill is more reliable for tree kills
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                print(f"[+] Terminated {name} service.")
            except Exception:
                proc.terminate()

        print("[+] All services stopped successfully.")

if __name__ == "__main__":
    main()
