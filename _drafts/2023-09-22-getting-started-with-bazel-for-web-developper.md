---
layout: post
title: "Getting started with Bazel for web developers"
banner : assets/svg/bazel.svg
title_picture: assets/svg/bazel.svg
comments: true
---




In this post, I want to share my story of how I started experimenting with Bazel and eventually fell in love with it.

To understand why Bazel exists, let's go back to the basics. As a self-taught developer, I have often struggled with the abstractions introduced by new frameworks. This made it difficult for me to grasp fundamental software engineering concepts, despite having a solid introduction to software and hardware design during my engineering degree.

A C++ programmer would have no trouble understanding why Bazel is useful and how to use it. C++ developers typically have a mindset of understanding how things work under the hood. However, modern web developers, especially those confined to frameworks, often lack this understanding due to the numerous layers of abstraction added on top of the actual software workings.

Let me remind you how any software works:
> source code > build process > executable

If you don't understand how your application goes from source code to an executable, you won't be able to effectively use Bazel to organize your development process for that application. Unfortunately, the majority of React developers don't even know what  `npm run build`  does under the hood.

Now, let's explore why you would ever need to use Bazel. Bazel is particularly useful for orchestrating multiple projects with different languages in a monorepository. In an ideal scenario, you would have:

- One hermetic toolchain and dependency setup for every language, regardless of the platform.
- Build, test, run, and deploy configurations set up once, and then you can use  `bazel build/test/run //path:target`  to execute them.

Let's consider a JavaScript project (this applies to all its variants). A typical React application has the following structure:

```plaintext
my-react-app/
  ├── node_modules/       # Dependencies (auto-generated)
  ├── public/
  │   ├── index.html      # Main HTML file
  │   └── favicon.ico     # Favicon (optional)
  ├── src/
  │   ├── index.js        # Entry point
  │   ├── App.js          # Main application component
  │   ├── components/     # Folder for reusable components
  │   │   ├── Header.js   # Example component
  │   │   ├── Footer.js   # Example component
  │   ├── styles/         # Folder for CSS or SCSS files (optional)
  │   │   ├── App.css     # Styles for App.js
  │   ├── assets/         # Folder for static assets like images (optional)
  │   │   ├── logo.png    # Example image
  ├── package.json         # Project dependencies and scripts
```

To integrate this into a monorepo, we need to make it use the Node.js version of the repository and the repository's dependency module. Then, we need to tell Bazel how to build the app.

By the way, do you know how a React app is built? 🧐

First, the source files are transpiled to a basic JavaScript version using tools like Babel. Then, the source needs to be bundled into a format that can be executed on the intended platform, such as a browser. The executable for the browser is an HTML file with JavaScript code. So, our bundle will simply consist of:
```plaintext
build/
  ├── index.html     # Main HTML file
  ├── main.js        # Minified and bundled JavaScript file

```
The  `index.html`  file will look like this:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="main.js"></script>
</body>
</html>
```
To achieve this, we use bundlers like Webpack, ESBuild, or Rust.

Now, let's configure Bazel to build our app while keeping a few things in mind:

- Take advantage of what Bazel offers.
- Avoid reinventing the wheel.

First, let's register the global, constant, hermetic toolchain in :

```python
####### Node.js version #########
# By default, you get the node version from DEFAULT_NODE_VERSION 
# in @rules_nodejs//nodejs:repositories.bzl
# Optionally, you can pin a different node version:
bazel_dep(name = "rules_nodejs", version = "5.8.2")
node = use_extension("@rules_nodejs//nodejs:extensions.bzl", "node")
node.toolchain(node_version = "16.14.2")
#################################
```
To test if Bazel is using the given version, we can create a  `hello.mjs`  file and run it with  `js_binary`  like this:
```javascript
// hello.mjs
console.log(process.version);
```
```python
js_binary(
    name = "hello",
    entry_point = "hello.mjs",
)
```
Great! Now let's configure the dependency manager:
```python
npm = use_extension("@aspect_rules_js//npm:extensions.bzl",
 "npm", dev_dependency = True)
npm.npm_translate_lock(
    name = "npm",
    bins = {
        "react-scripts": [
            "react-scripts=./bin/react-scripts.js",
        ],
    },
    data = [
        "//:package.json",
        "//:pnpm-workspace.yaml",
        "//:packages/my-app/package.json",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    update_pnpm_lock = 1,
)

use_repo(npm, "npm")
```

One very important note:  `rules_js`  relies on  `pnpm-lock.yaml` . To automatically generate it, use  `update_pnpm_lock = 1`  with  `data = ["//:package.json"],` .
What does all of this mean? Hahaha!

The first line is simple; we define the npm extension using  `use_extension` .  `use_repo`  and  `use_extension`  are built-in functions introduced when Bazel modules (bzlmod) were implemented.

So, now we have the Node.js version and the dependencies configured. how and where do we define the build rules for Bazel? 

for every packages or app in order to build it ,we need to define the BUILD file in the root of this app
with the right bazel rule to build

for CRA app "aspect" team already has writen a rule that wrap "react-script" to build a CRA

it is loaded from  `load("@npm//:react-scripts/package_json.bzl", cra_bin = "bin")` :
```python
cra_bin.react_scripts(
    # Note: If you want to change the name make sure you update BUILD_PATH below accordingly
    # https://create-react-app.dev/docs/advanced-configuration/
    name = "build",
    srcs = CRA_DEPS,
    args = ["build"],
    chdir = package_name(),
    env = {"BUILD_PATH": "./build"},
    out_dirs = ["build"],
)
```
`@npm//:react-scripts/package_json.bzl` this  is  called a [Bazel labels]()
let learn about lables and learn how  to read them flow this link link[]



everthing build fine ,one think to note is that this bazel rule use `pnpm` so in `package.json` need to fix peer dependency:
```json
"pnpm": {
    "//packageExtensions": "Fix missing dependencies in npm
     packages, see https://pnpm.io/package_json#pnpmpackageextensions",
    "packageExtensions": {
 
      "postcss-loader": {
        "peerDependencies": {
          "postcss-flexbugs-fixes": "*",
          "postcss-preset-env": "*",
          "postcss-normalize": "*"
        }
      }
    }
  }
```


note that we are using pnpm workspaces
you need to run this commende to generate the pnpm lock file:
`bazel run -- @pnpm//:pnpm --dir $PWD install --lockfile-only`



Check the complete version on [GitHub repository](https://github.com/younessssssss/Bazel-React-Monorepo-Example) for more details.

Feel free to comment below if you have any thoughts or questions. Your input is highly appreciated!