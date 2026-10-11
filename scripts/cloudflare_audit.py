"""Read one fixed Pages project; emit only an allowlisted public report."""
import json
import os
import re
import sys
import urllib.error
import urllib.request

REPOSITORY = "MM20261010/columns-lab"
PROJECT = "columns-lab"
MAX_BYTES = 1024 * 1024


class AuditError(Exception):
    """Messages must be static and never contain upstream bodies or credentials."""


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise AuditError("redirect_refused")


def configuration(env):
    if (env.get("GITHUB_REPOSITORY") != REPOSITORY
            or env.get("GITHUB_REF") != "refs/heads/main"
            or env.get("GITHUB_EVENT_NAME") != "workflow_dispatch"):
        raise AuditError("untrusted_execution_context")
    account = env.get("CF_ACCOUNT_ID", "")
    token = env.get("CF_API_TOKEN", "")
    if not re.fullmatch(r"[0-9a-fA-F]{32}", account):
        raise AuditError("account_id_missing_or_invalid")
    if not token or len(token) > 4096 or any(ord(c) < 33 or ord(c) > 126 for c in token):
        raise AuditError("api_token_missing_or_invalid")
    return account, token


def fetch_project(account, token, opener=None):
    # No arbitrary URL/project/method/body input, no retries, no redirects.
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/pages/projects/{PROJECT}"
    request = urllib.request.Request(url, method="GET", headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
    })
    opener = opener or urllib.request.build_opener(NoRedirect())
    try:
        with opener.open(request, timeout=20) as response:
            raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise AuditError("response_too_large")
        body = json.loads(raw)
        if not isinstance(body, dict) or body.get("success") is not True:
            raise AuditError("api_unsuccessful")
        if not isinstance(body.get("result"), dict):
            raise AuditError("invalid_response")
        return body["result"]
    except urllib.error.HTTPError as error:
        # Never print error body, reason, URL, headers or traceback.
        raise AuditError(f"http_{int(error.code)}") from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise AuditError("transport_failed") from None
    except (ValueError, TypeError):
        raise AuditError("invalid_response") from None


def object_value(value):
    return value if isinstance(value, dict) else {}


def report(project):
    build = object_value(project.get("build_config"))
    source = object_value(project.get("source"))
    config = object_value(source.get("config"))
    canonical = object_value(project.get("canonical_deployment"))
    stage = object_value(canonical.get("latest_stage"))
    metadata = object_value(object_value(canonical.get("deployment_trigger")).get("metadata"))
    expected_source = (source.get("type") == "github"
                       and config.get("owner") == "MM20261010"
                       and config.get("repo_name") == PROJECT)
    if (project.get("name") != PROJECT
            or project.get("subdomain") != "columns-lab.pages.dev"
            or not expected_source):
        raise AuditError("target_identity_mismatch")
    status = stage.get("status")
    status = status if status in {"success", "failure", "active", "idle", "canceled"} else "unknown"
    commit = metadata.get("commit_hash")
    commit = commit if isinstance(commit, str) and re.fullmatch(r"[0-9a-f]{40}", commit) else None
    enabled = config.get("production_deployments_enabled")
    enabled = enabled if type(enabled) is bool else None
    # No recursive sanitization: construct from scratch. Raw config includes secrets.
    return {
        "schema_version": 1,
        "project": PROJECT,
        "github_source_matches": True,
        "production_branch_is_main": project.get("production_branch") == "main",
        "production_auto_deploy_enabled": enabled,
        "output_directory_is_site": build.get("destination_dir") == "site",
        "build_command_is_empty": build.get("build_command") in (None, ""),
        "analytics_config_present": bool(build.get("web_analytics_tag") and build.get("web_analytics_token")),
        "analytics_collection_verified": False,
        "canonical_deployment_status": status,
        "canonical_commit_hash": commit,
    }


def main():
    try:
        account, token = configuration(os.environ)
        result = report(fetch_project(account, token))
        print(json.dumps(result, ensure_ascii=True, sort_keys=True))
        for key in ("production_branch_is_main", "output_directory_is_site", "build_command_is_empty"):
            if result[key] is not True:
                return 2
        return 0
    except AuditError as error:
        print(json.dumps({"audit": "failed", "reason": str(error)}))
        return 1
    except Exception:
        print('{"audit":"failed","reason":"unexpected_error"}')
        return 1


if __name__ == "__main__":
    sys.exit(main())
