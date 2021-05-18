# 📸 snap-tweet <a href="https://npm.im/snap-tweet"><img src="https://badgen.net/npm/v/snap-tweet"></a> <!--<a href="https://npm.im/snap-tweet"><img src="https://badgen.net/npm/dm/snap-tweet"></a> --><a href="https://packagephobia.now.sh/result?p=snap-tweet"><img src="https://packagephobia.now.sh/badge?p=snap-tweet"></a>

Command-line tool to capture clean and simple tweet snapshots.

<p align="center">
  <img src=".github/example.png" width="60%">
  <br>
  <em>Light mode</em>
</p>

<p align="center">
  <img src=".github/example-dark.png" width="60%">
  <br>
  <em>Dark mode</em>
</p>

### Features
- 🎛 Adjustable width
- 💅 Rounded corners & transparent background
- 🌚 Dark-mode
- 🌐 Customizable locale
- 🙅‍♀️ No "Share" & "Info" buttons
- 💖 No watermark

<sub>Support this project by ⭐️ starring and sharing it. [Follow me](https://github.com/privatenumber) to see what other cool projects I'm working on! ❤️</sub>

## 🚀 Install
```sh
npm i -g snap-tweet
```

### npx
```sh
npx snap-tweet
```

## 🚦 Quick usage
```sh
snap-tweet https://twitter.com/jack/status/20
```

### Manual
```
snap-tweet

Usage:
  $ snap-tweet <...tweet urls>

Options:
  -o, --output-dir <path>  Tweet screenshot output directory
  -w, --width <width>      Width of tweet (default: 550)
  -t, --show-thread        Show tweet thread
  -d, --dark-mode          Show tweet in dark mode
  -l, --locale <locale>    Locale (default: en)
  -h, --help               Display this message
  -v, --version            Display version number

Examples:
$ snap-tweet https://twitter.com/jack/status/20
$ snap-tweet https://twitter.com/TwitterJP/status/578707432 --locale ja
$ snap-tweet https://twitter.com/Interior/status/463440424141459456 --width 900 --dark-mode
```

## 🏋️‍♀️ Motivation
It all started when I simply wanted to embed a couple tweets into a Google Doc...

Quick googling showed that there's no way to embed an actual tweet because Google Docs  doesn't support HTML iframes or JavaScript. And I wasn't going to install a plugin just for some tweets.


I figured I could just take a screenshot of the tweet. But only to realize I would be spending way too much time cropping each tweet, and they still wouldn't be perfect because of the lack of transparency behind the rounded corners. And not to mention, the static screenshot would include buttons like "Copy link to Tweet" that looked actionable but actually weren't.

I found services like [Screenshot Guru](https://screenshot.guru) (and their [Twitter Screenshots](https://chrome.google.com/webstore/detail/twitter-screenshots/imfhndkgmnbnogfjcecdpopaooachgco) Chrome extension), [Pikaso](https://pikaso.me/), etc. but none of them met my needs (low quality images, actionable buttons present, watermarks, etc.).

All I wanted to do was to embed the tweet like how it looks in the [official embedder](https://publish.twitter.com/#) into a static environment. No sign up, no watermark, no BS... It shouldn't be this hard! 🤯

So of course, I spent a few hours developing a tool to save us all the headache 😇

_(I know, this is some pretty crazy [yak shaving](https://en.wiktionary.org/wiki/yak_shaving). Checkout [my other projects](https://github.com/privatenumber) to see how deep I've gone.)_


## 🙋‍♀️ Need help?
If you have a question about usage, [ask on Discussions](https://github.com/privatenumber/snap-tweet/discussions).

If you'd like to make a feature request or file a bug report, [open an Issue](https://github.com/privatenumber/snap-tweet/issues).
