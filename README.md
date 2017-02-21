Rdcli
===

[![npm version](https://badge.fury.io/js/rdcli.svg)](https://badge.fury.io/js/rdcli)
[![Build Status](https://travis-ci.org/jcherqui/rdcli.svg?branch=master)](https://travis-ci.org/jcherqui/rdcli/)
[![npm download](https://img.shields.io/npm/dt/rdcli.svg)](https://www.npmjs.com/package/rdcli)
[![Code Climate](https://codeclimate.com/github/jcherqui/rdcli/badges/gpa.svg)](https://codeclimate.com/github/jcherqui/rdcli)

> A simple CLI tool to unrestrict links with real-debrid.com

Download DDL links, magnets and torrent files.

[![asciicast](https://raw.githubusercontent.com/jcherqui/rdcli/master/screencast.gif)](https://raw.githubusercontent.com/jcherqui/rdcli/master/screencast.gif)

## Installation

`npm i -g rdcli`

## Usage

`rdcli <url|magnet|torrent>`

Download DDL file:

`rdcli http://uptobox.com/1gdncohxbqkp`

Download magnet file:

`rdcli 'magnet:?xt=urn:btih:33130de5c14a8bb5410746ee5a9604cdfb9538ef'`

Download torrent file:

`rdcli Back.to.the.Future.Trilogy.1080p.BluRay.x264.torrent`

## Development

Install dependencies:

`make install`

Start project:

`make run`

Run tests:

`make test`

License
---

MIT

**Free Software, Hell Yeah!**
