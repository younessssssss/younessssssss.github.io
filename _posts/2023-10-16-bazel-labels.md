---
layout: post
comments: true
---

## What Are Bazel Labels?

### Defining Key Terms

- **Workspace:**
  Bazel builds software from source code organized in a directory tree called a workspace.

- **Repositories:**
  The root of the workspace containing the WORKSPACE file is the main repo and is identified with `@`.

- **Package:**
  Source files in the workspace are organized in a nested hierarchy of packages. Each package is a directory that contains a set of related source files and one BUILD file.

- **BUILD File:**
  The BUILD file specifies what software outputs can be built from the source.

- **Target:**
  A package is a container of targets, which are defined in the package's BUILD file. Most targets are one of two principal kinds, files and rules. `target-name` is the name of the target within the package. The name of a rule is the value of the name attribute in the rule's declaration in a BUILD file; the name of a file is its pathname relative to the directory containing the BUILD file.

### Labels

A label is the name that references a target for a specific package:

`@myrepo//packages/myapp:targetname`

A label is constructed of three parts:

- The repository name identified with `@myrepo`.
- The root path to the package (where the BUILD file of the package is located) `//packages/myapp`.
- Lastly, the target name (a name or a path depending on the target if is a rule or file) `:targetname`.

If a target is a file, the name of the target is the path to the file from where the BUILD file is located:

`@myrepo//packages/myapp:testdata/input.txt`

For example, here, the name of the target is `testdata/input.txt`.

## To Be Continued

