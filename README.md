# What is Yue?

Yue was a Discord economy bot, with a lot of features in economy that I developed, with plans to also add anime later, but as the other owners of the bot quit and were busy, I also quit developing it and eventually deleted the bot

# Why is it Open Source?

As it has a lot of commands and the bot isn't there anymore, it's useless to be closed source anyway so I guess it might at least help people learn stuff if it's open source and as I was still learning at that time, current code isn't great especially the codes related to database, I would highly suggest you to change interacting with database but apart from that, the code is still good

# How to run the bot?

Install packages:

```
$ npm i
```

As it uses TypeScript, you first have to compile the code

```
$ tsc
```

Compiled code would be in `dist` folder so you have to change your directory to `dist`, you can also change it by editing `outDir` in `tsconfig.json`

```
$ cd dist
```

Copy contents of `.env` from `src` folder and add a `.env` file in `dist` folder, pasting the contents and filling up the values and then start the bot

```
$ node yue.js
```
