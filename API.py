# import subprocess

# def execute_node_script(script_path):
#     try:
#         result = subprocess.run(['node', script_path], capture_output=True, text=True)
#         if result.returncode == 0:
#             print("Script output:", result.stdout)
#         else:
#             print("Script error:", result.stderr)
#     except Exception as e:
#         print("An error occurred while executing the script:", str(e))

# node_script_path = './server.js'
# output = execute_node_script(node_script_path)
# print(output)

# All functions should have the ability to either operate without thee HTML, or with
# I believe this requires two subsections for each
def main():
    # Optional
    def run_node_js():
        pass
    
    # Interact with Notification Building
    def get_default_state():
        pass
    
    def modify_default_state():
        pass

    def create_notification():
        pass

    def modify_state():
        pass

# Interact with Notification DB
    def show_notification_db():
        pass

    def save_notification():
        pass

    def import_notification():
        pass

# Functions to bring up HTML Aspects
    def show_HTML():
        pass

    def show_preview():
        pass

# if __name__ == "__main__":
#     main()