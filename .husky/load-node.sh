# Git GUIs and IDEs do not load nvm, so select the project's Node (.nvmrc) before running a hook.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use >/dev/null 2>&1 || true
fi
