Rdcli
===

[![npm version](https://badge.fury.io/js/rdcli.svg)](https://badge.fury.io/js/rdcli)
[![Build Status](https://travis-ci.org/jcherqui/rdcli.svg?branch=master)](https://travis-ci.org/jcherqui/rdcli/)

> A simple CLI tool to unrestrict links with real-debrid.com

Download links, magnets and torrent files.

## Installation

`npm i -g rdcli`

## Usage

`rdcli <url|magnet|torrent>`

### Download DDL file

`rdcli http://uptobox.com/1gdncohxbqkp`

### Download magnet file

`rdcli magnet:?xt=urn:btih:33130de5c14a8bb5410746ee5a9604cdfb9538ef`

### Download torrent file

`rdcli Back.to.the.Future.Trilogy.1080p.BluRay.x264.torrent`

# TODO

- [ ] Handle Ctrl+u and backspace in prompt password
- [ ] Add [ora](https://www.npmjs.com/package/ora) spinner
- [ ] Update text errors

License
---

MIT

**Free Software, Hell Yeah!**
