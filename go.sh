#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper for this repo (Amplify + local build helpers)
# Preset defaults (can be overridden via env)
PRESET1_NAME=${PRESET1_NAME:-local}
PRESET1_PROFILE=${PRESET1_PROFILE:-default}
PRESET1_APP_ID=${PRESET1_APP_ID:-ddhdykrrt63i6}
PRESET1_BRANCH=${PRESET1_BRANCH:-release}
PRESET1_REGION=${PRESET1_REGION:-eu-central-1}

PRESET2_NAME=${PRESET2_NAME:-dev}
PRESET2_PROFILE=${PRESET2_PROFILE:-dev}
PRESET2_APP_ID=${PRESET2_APP_ID:-ddhdykrrt63i6}
PRESET2_BRANCH=${PRESET2_BRANCH:-dev}
PRESET2_REGION=${PRESET2_REGION:-eu-central-1}

PRESET3_NAME=${PRESET3_NAME:-prod}
PRESET3_PROFILE=${PRESET3_PROFILE:-prod}
PRESET3_APP_ID=${PRESET3_APP_ID:-ddhdykrrt63i6}
PRESET3_BRANCH=${PRESET3_BRANCH:-main}
PRESET3_REGION=${PRESET3_REGION:-eu-central-1}

cmd_menu(){
  echo "Select account preset:"
  echo "  1) $PRESET1_NAME (profile: $PRESET1_PROFILE, branch: $PRESET1_BRANCH)"
  echo "  2) $PRESET2_NAME (profile: $PRESET2_PROFILE, branch: $PRESET2_BRANCH)"
  echo "  3) $PRESET3_NAME (profile: $PRESET3_PROFILE, branch: $PRESET3_BRANCH)"
  read -rp "Choose 1,2 or 3: " sel
  case "$sel" in
    1)
      sel_profile="$PRESET1_PROFILE"; sel_app="$PRESET1_APP_ID"; sel_branch="$PRESET1_BRANCH"; sel_region="$PRESET1_REGION";;
    2)
      sel_profile="$PRESET2_PROFILE"; sel_app="$PRESET2_APP_ID"; sel_branch="$PRESET2_BRANCH"; sel_region="$PRESET2_REGION";;
    3)
      sel_profile="$PRESET3_PROFILE"; sel_app="$PRESET3_APP_ID"; sel_branch="$PRESET3_BRANCH"; sel_region="$PRESET3_REGION";;
    *)
      echo "Invalid selection"; return 1;;
  esac

  export AWS_PROFILE="$sel_profile"
  APP_ID="$sel_app" BRANCH="$sel_branch" REGION="$sel_region"
  echo "Selected: profile=$sel_profile app=$APP_ID branch=$BRANCH region=$REGION"

  echo "Choose action:"
  echo "  1) Run frontend locally (npm run dev)"
  echo "  2) Deploy to Amplify (push + ensure branch + start-release)"
  echo "  3) Exit"
  read -rp "Select 1-3: " act

  case "$act" in
    1)
      echo "Starting frontend dev server (runs in foreground). Use Ctrl+C to stop."
      npm install
      npm run dev
      ;;
    2)
      echo "Deploying branch '$BRANCH' to Amplify..."
      if [ "$FORCE_PUSH" = true ]; then
        git push --force origin "$BRANCH"
      else
        cmd_push
      fi
      if [ "$AUTO_BUILD" = true ]; then
        cmd_create_branch
      else
        require_aws
        aws amplify get-branch --app-id "$APP_ID" --branch-name "$BRANCH" --region "$REGION" >/dev/null 2>&1 || \
          aws amplify create-branch --app-id "$APP_ID" --branch-name "$BRANCH" --enable-auto-build false --region "$REGION"
      fi
      cmd_start_release
      ;;
    3)
      echo "Exit."; return 0
      ;;
    *)
      echo "Invalid action"; return 1;;
  esac
}


cmd_push(){
  echo "Pushing branch '$BRANCH' to origin..."
  # Add and commit if there are staged/untracked changes
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    # try a commit; if nothing to commit, continue
    git commit -m "deploy: local snapshot" || true
  fi
  git push origin "$BRANCH"
}

cmd_build(){
  echo "Building frontend..."
  npm install
  npm run build
}

cmd_create_branch(){
  require_aws
  echo "Checking if Amplify branch '$BRANCH' exists..."
  if aws amplify get-branch --app-id "$APP_ID" --branch-name "$BRANCH" --region "$REGION" >/dev/null 2>&1; then
    echo "Branch '$BRANCH' already exists in Amplify."
  else
    echo "Creating Amplify branch '$BRANCH'..."
    aws amplify create-branch --app-id "$APP_ID" --branch-name "$BRANCH" --enable-auto-build true --region "$REGION"
  fi
}

cmd_start_release(){
  require_aws
  echo "Starting RELEASE job for branch '$BRANCH'..."
  aws amplify start-job --app-id "$APP_ID" --branch-name "$BRANCH" --job-type RELEASE --region "$REGION"
}

cmd_list_branches(){
  require_aws
  aws amplify list-branches --app-id "$APP_ID" --region "$REGION"
}

cmd_list_jobs(){
  require_aws
  aws amplify list-jobs --app-id "$APP_ID" --branch-name "$BRANCH" --region "$REGION"
}

cmd_delete_branch(){
  require_aws
  if [ "$#" -lt 1 ]; then
    echo "Usage: $0 delete-branch BRANCH_NAME" >&2
    exit 2
  fi
  local b="$1"
  echo "Deleting Amplify branch '$b'..."
  aws amplify delete-branch --app-id "$APP_ID" --branch-name "$b" --region "$REGION"
}

### parse global options: --app-id, --branch, --region, --force, --no-auto-build, --role-arn
while [[ ${1:-} == --* ]]; do
  case "$1" in
    --app-id)
      APP_ID="$2"; shift 2;;
    --branch)
      BRANCH="$2"; shift 2;;
    --region)
      REGION="$2"; shift 2;;
    --force|-f)
      FORCE_PUSH=true; shift;;
    --no-auto-build)
      AUTO_BUILD=false; shift;;
    --role-arn)
      ROLE_ARN="$2"; shift 2;;
    --help)
      usage; exit 0;;
    *)
      echo "Unknown global option: $1"; usage; exit 2;;
  esac
done

cmd=${1:-}
shift 1 2>/dev/null || true

# If no command provided, run interactive menu (no help shown)
if [ -z "${cmd}" ]; then
  cmd_menu
  exit 0
fi

case ${cmd} in
  help) usage ;; 
  status) cmd_status ;; 
  push)
    if [ "$FORCE_PUSH" = true ]; then
      echo "Force pushing branch '$BRANCH' to origin..."
      git push --force origin "$BRANCH"
    else
      cmd_push
    fi
    ;;
  build) cmd_build ;; 
  create-branch)
    # pass AUTO_BUILD flag to create
    if [ "$AUTO_BUILD" = true ]; then
      cmd_create_branch
    else
      require_aws
      echo "Creating branch without auto-build: $BRANCH"
      aws amplify create-branch --app-id "$APP_ID" --branch-name "$BRANCH" --enable-auto-build false --region "$REGION"
    fi
    ;;
  start-release) cmd_start_release ;; 
  deploy)
    # deploy: push (respect force), ensure branch, and start release
    if [ "$FORCE_PUSH" = true ]; then
      git push --force origin "$BRANCH"
    else
      cmd_push
    fi
    if [ "$AUTO_BUILD" = true ]; then
      cmd_create_branch
    else
      require_aws
      aws amplify get-branch --app-id "$APP_ID" --branch-name "$BRANCH" --region "$REGION" >/dev/null 2>&1 || \
        aws amplify create-branch --app-id "$APP_ID" --branch-name "$BRANCH" --enable-auto-build false --region "$REGION"
    fi
    cmd_start_release
    ;;
  list-branches) cmd_list_branches ;; 
  list-jobs) cmd_list_jobs ;; 
  delete-branch) shift; cmd_delete_branch "$@" ;; 
  *) echo "Unknown command: ${cmd}"; usage; exit 2 ;;
esac
