#!/bin/bash

# fast fail.
set -eo pipefail

SCRIPT_PATH="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_PATH/.." || exit

# Install dependencies for all plugins.
for plugin in $(find plugins -maxdepth 1 -mindepth 1 -type d); do
  echo "Installing dependencies for $plugin"
  cd "$plugin" || exit
  yarn install
  cd "$SCRIPT_PATH/.." || exit
done