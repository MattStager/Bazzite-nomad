#!/bin/bash
# Test the NOMAD install script across multiple distros
# Requires the test VMs to be running (see homelab-gitops/terraform/proxmox/nomad-test-vms.tf)

set -euo pipefail

RESET='\033[0m'
GREEN='\033[1;32m'
RED='\033[1;31m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_SCRIPT="${SCRIPT_DIR}/install_nomad.sh"

# Test VM IPs (seoul node, VLAN 20)
declare -A VMS=(
  ["debian"]="10.0.20.200"
  ["arch"]="10.0.20.201"
  ["fedora"]="10.0.20.202"
  ["opensuse"]="10.0.20.203"
)

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"
SSH_USER="ben"

log() {
  echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"
}

test_distro() {
  local distro=$1
  local ip=$2
  local logfile="/tmp/nomad-test-${distro}.log"

  echo ""
  echo -e "${CYAN}========================================${RESET}"
  log "Testing on ${distro} (${ip})"
  echo -e "${CYAN}========================================${RESET}"

  # Check VM is reachable
  if ! ssh ${SSH_OPTS} "${SSH_USER}@${ip}" "echo 'VM reachable'" 2>/dev/null; then
    echo -e "${RED}FAIL${RESET} - Cannot reach ${distro} VM at ${ip}"
    return 1
  fi

  # Show distro info
  log "Distro info:"
  ssh ${SSH_OPTS} "${SSH_USER}@${ip}" "cat /etc/os-release | head -5" 2>/dev/null

  # Copy install script to VM
  log "Copying install script..."
  scp ${SSH_OPTS} "${INSTALL_SCRIPT}" "${SSH_USER}@${ip}:/tmp/install_nomad.sh" 2>/dev/null

  # Run the install script (auto-accept prompts)
  # We pipe 'y' twice: once for install confirmation, once for license acceptance
  log "Running install script (logging to ${logfile})..."
  if ssh ${SSH_OPTS} "${SSH_USER}@${ip}" "printf 'y\ny\n' | sudo bash /tmp/install_nomad.sh" 2>&1 | tee "${logfile}"; then
    echo -e "${GREEN}PASS${RESET} - ${distro} install completed successfully"
    return 0
  else
    echo -e "${RED}FAIL${RESET} - ${distro} install failed (exit code $?)"
    echo -e "${YELLOW}Check log: ${logfile}${RESET}"
    return 1
  fi
}

# --- Main ---

echo -e "${CYAN}Project NOMAD - Multi-Distro Install Test${RESET}"
echo -e "${CYAN}===========================================${RESET}"
echo ""

# Optionally test a single distro
if [[ "${1:-}" != "" ]]; then
  if [[ -v "VMS[$1]" ]]; then
    test_distro "$1" "${VMS[$1]}"
    exit $?
  else
    echo "Unknown distro: $1"
    echo "Available: ${!VMS[*]}"
    exit 1
  fi
fi

# Test all distros
results=()
for distro in debian arch fedora opensuse; do
  if test_distro "$distro" "${VMS[$distro]}"; then
    results+=("${GREEN}PASS${RESET} ${distro}")
  else
    results+=("${RED}FAIL${RESET} ${distro}")
  fi
done

# Summary
echo ""
echo -e "${CYAN}========================================${RESET}"
echo -e "${CYAN}Test Results Summary${RESET}"
echo -e "${CYAN}========================================${RESET}"
for result in "${results[@]}"; do
  echo -e "  $result"
done
