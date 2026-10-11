"""Offline tests only; fake credentials, no Cloudflare network calls."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import unittest
import urllib.error
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("audit", Path(__file__).parents[1] / "scripts/cloudflare_audit.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def project():
    return {"name": "columns-lab", "subdomain": "columns-lab.pages.dev", "production_branch": "main",
            "source": {"type": "github", "config": {"owner": "MM20261010", "repo_name": "columns-lab", "production_deployments_enabled": True}},
            "build_config": {"destination_dir": "site", "build_command": "", "web_analytics_tag": "PRIVATE_TAG", "web_analytics_token": "PRIVATE_BEACON"},
            "deployment_configs": {"production": {"env_vars": {"PRIVATE": {"value": "PRIVATE_ENV"}}}},
            "canonical_deployment": {"latest_stage": {"status": "success"}, "deployment_trigger": {"metadata": {"commit_hash": "a" * 40}}}}


class FakeResponse:
    def __init__(self, data): self.data = data
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def read(self, size): return self.data[:size]


class Tests(unittest.TestCase):
    def test_report_excludes_nested_secrets_and_untrusted_strings(self):
        p = project()
        p["canonical_deployment"]["latest_stage"]["status"] = "::error::PRIVATE_INJECTION"
        p["canonical_deployment"]["deployment_trigger"]["metadata"]["commit_hash"] = "PRIVATE_HASH"
        result = audit.report(p)
        self.assertNotIn("PRIVATE", json.dumps(result))
        self.assertEqual(result["canonical_deployment_status"], "unknown")
        self.assertIsNone(result["canonical_commit_hash"])
        self.assertTrue(result["analytics_config_present"])
        self.assertFalse(result["analytics_collection_verified"])

    def test_wrong_project_and_wrong_github_rejected(self):
        for field, value in [("name", "other"), ("subdomain", "other.pages.dev")]:
            p = project(); p[field] = value
            with self.assertRaises(audit.AuditError): audit.report(p)
        p = project(); p["source"]["config"]["owner"] = "other"
        with self.assertRaises(audit.AuditError): audit.report(p)

    def test_context_and_credentials_fail_closed(self):
        env = {"GITHUB_REPOSITORY": "MM20261010/columns-lab", "GITHUB_REF": "refs/heads/main", "GITHUB_EVENT_NAME": "workflow_dispatch", "CF_ACCOUNT_ID": "a" * 32, "CF_API_TOKEN": "fake_token"}
        self.assertEqual(audit.configuration(env), ("a" * 32, "fake_token"))
        for key, value in [("GITHUB_REPOSITORY", "attacker/fork"), ("GITHUB_REF", "refs/heads/pr"), ("GITHUB_EVENT_NAME", "pull_request_target"), ("CF_ACCOUNT_ID", "../bad"), ("CF_API_TOKEN", ""), ("CF_API_TOKEN", "bad\nheader")]:
            with self.assertRaises(audit.AuditError): audit.configuration({**env, key: value})

    def test_exact_get_only_and_one_request(self):
        calls = []
        class Opener:
            def open(self, request, timeout):
                calls.append(request)
                return FakeResponse(json.dumps({"success": True, "result": project()}).encode())
        self.assertEqual(audit.fetch_project("a" * 32, "fake_token", Opener())["name"], "columns-lab")
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].get_method(), "GET")
        self.assertEqual(calls[0].full_url, "https://api.cloudflare.com/client/v4/accounts/" + "a" * 32 + "/pages/projects/columns-lab")
        self.assertIsNone(calls[0].data)

    def test_redirect_refused(self):
        with self.assertRaises(audit.AuditError):
            audit.NoRedirect().redirect_request(None, None, 302, "", {}, "https://attacker.example/")

    def test_http_failure_never_leaks_body_or_header(self):
        class Opener:
            def open(self, *args, **kwargs):
                raise urllib.error.HTTPError("PRIVATE_URL", 403, "PRIVATE_REASON", {"PRIVATE": "TOKEN"}, io.BytesIO(b"PRIVATE_BODY"))
        with self.assertRaisesRegex(audit.AuditError, "^http_403$"):
            audit.fetch_project("a" * 32, "fake_token", Opener())

    def test_large_or_failed_response_rejected(self):
        for raw in [b"x" * (audit.MAX_BYTES + 1), b"not JSON", b'{"success":false,"errors":["PRIVATE"]}']:
            class Opener:
                def open(self, *args, **kwargs): return FakeResponse(raw)
            with self.assertRaises(audit.AuditError): audit.fetch_project("a" * 32, "fake_token", Opener())

    def test_unexpected_exception_has_no_traceback(self):
        output = io.StringIO()
        with patch.object(audit, "configuration", side_effect=RuntimeError("PRIVATE_TOKEN")), contextlib.redirect_stdout(output):
            self.assertEqual(audit.main(), 1)
        self.assertEqual(json.loads(output.getvalue()), {"audit": "failed", "reason": "unexpected_error"})


if __name__ == "__main__":
    unittest.main()
