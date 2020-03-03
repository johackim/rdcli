Rdcli
===

[![](https://img.shields.io/github/tag/johackim/rdcli.svg?label=version&style=flat-square&colorA=0d7377&colorB=44c2c7)](https://github.com/johackim/rdcli/releases)
[![](https://img.shields.io/badge/license-GPL%20v3%2B-yellow.svg?style=flat-square&colorA=0d7377&colorB=44c2c7)](https://raw.githubusercontent.com/johackim/rdcli/master/LICENSE.txt)
[![](https://img.shields.io/travis/johackim/rdcli.svg?style=flat-square&colorA=0d7377&colorB=44c2c7)](https://travis-ci.org/johackim/rdcli/branches)
[![](https://img.shields.io/codeclimate/maintainability/johackim/rdcli.svg?style=flat-square&colorA=0d7377&colorB=44c2c7)](https://codeclimate.com/github/johackim/rdcli)
[![](https://img.shields.io/npm/dt/rdcli.svg?style=flat-square&colorA=0d7377&colorB=44c2c7)](https://www.npmjs.com/package/rdcli)

> The simple way to download and unrestrict DDL files, torrents and magnets.

[![asciicast](https://raw.githubusercontent.com/johackim/rdcli/master/screencast.gif)](https://raw.githubusercontent.com/johackim/rdcli/master/screencast.gif)

## Installation

```bash
npm install --global rdcli
```

And set your real-debrid account as enviroment variable on your `~/.bashrc`

```bash
export REALDEBRID_USERNAME=your_username
export REALDEBRID_PASSWORD=your_password
```

## Usage

```bash
Usage: rdcli <url|magnet|torrent>

Options:

  -V, --version  output the version number
  -p, --print    Print unrestricted link only
  -h, --help     output usage information
```

## Running the tests

```bash
make test
```

## License

This project is licensed under the GNU GPL v3.0 - see the [LICENSE.txt](LICENSE.txt) file for details

**Free Software, Hell Yeah!**
