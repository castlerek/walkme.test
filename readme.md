# Test project for WalkMe

The task has been finished using several ES6-features, which Google Chrome supports natively.
They are:

* generators (imitation of async/await like in C# or ES7)
* fetch API (for web requests/responses)
* encapsulation with the new primitive type *Symbol*
* arrow functions (lambdas)

For local test, you may inject the following script in **app.html**

> <script type="text/javascript" async=""
>  src="https://cdn.walkme.com/users/7a75f78cb4644e4188ad82d063b1f54b/walkme_7a75f78cb4644e4188ad82d063b1f54b_https.js">
> </script>

Structure of plugin sources:

```
+-- asserts
|   +-- icon.png
|   +-- throbber.gif
+-- css
|   +-- style.css
+-- js
|   +-- content.js
|   +-- logic.js
+-- app.html
+-- manifest.json
+-- readme.md
```

Screenshots:

*- throbber animation while analyzing current HTML page*

![Image of running throbber](http://s13.postimg.org/a7smoslyv/Screenshot_84.png)

*- the successful result*

![Image of successful result](http://s16.postimg.org/4kiwi0c2t/Screenshot_86.png)

*- the unsuccessful result*

![Image of unsuccesful result](http://s8.postimg.org/w22l18rtx/Screenshot_87.png)