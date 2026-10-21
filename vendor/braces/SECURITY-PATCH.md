# Local security fork of braces 3.0.3

Original source: https://github.com/micromatch/braces/tree/3.0.3
License: MIT; original LICENSE retained.

This private local fork mitigates GHSA-vfj7-8cjw-p6xm. Upstream has no patched npm release as of 2026-10-21. The parser rejects combined brace/parenthesis nesting at 128 levels before creating a deeper tree. Public AST walkers validate caller-supplied trees iteratively, rejecting excessive depth, cycles and excessive node counts. Normal brace patterns preserve the upstream implementation. The package has a distinct private name and local version; it is not represented as an upstream release.

Remove the local override when an upstream release fixes the advisory and passes the regression tests. Do not delete this fork or ignore lifecycle/install failures while the override is active.
