#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper for this repo (Amplify + local build helpers)
# Usage: ./deploy.sh <command>
# Commands: help status push build create-branch start-release deploy list-branches list-jobs delete-branch

APP_ID=${APP_ID:-ddhdykrrt63i6}
REGION=${REGION:-eu-central-1}
BRANCH=${BRANCH:-release}
# defaults for options
FORCE_PUSH=${FORCE_PUSH:-false}
AUTO_BUILD=${AUTO_BUILD:-true}
ROLE_ARN=${ROLE_ARN:-}

usage(){
  cat <<EOF
Usage: $0 <command>
Commands:
  help             Show this message
  status           Show git status and last commit
  push             Commit (if any) and push local $BRANCH to origin
  build            Run frontend build (npm run build)
  create-branch    Create Amplify branch for $BRANCH (if missing)
  start-release    Start an Amplify RELEASE job for $BRANCH
  deploy           push -> ensure amplify branch -> start-release
  list-branches    List Amplify branches for app $APP_ID
  list-jobs        List Amplify jobs for branch $BRANCH
  delete-branch BR  Delete branch BR from Amplify
EOF
}

require_aws(){
  if ! command -v aws >/dev/null 2>&1; then
    echo "aws CLI not found. Install and configure AWS credentials." >&2
    exit 2
  fi
}

cmd_status(){
  git rev-parse --abbrev-ref HEAD || true
  git status --short || true
  git log -1 --oneline || true
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

cmd=${1:-help}
shift || true

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
