if [[ $ENV != "alpha" && $ENV != "testing" ]]; then
  sed -i 's/https:\/\/sso.alpha.elenet.me/https:\/\/ssouat.rajax.me/g' config.js
  sed -i 's/alpha/beta/g' config.js
fi
