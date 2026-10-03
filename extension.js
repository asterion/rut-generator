// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.
//
// RUT Generator: generates random, valid Chilean RUTs for a company or a person and copies them
// to the clipboard, with a menu to choose the format and see the history.

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {RutIndicator} from './indicator.js';

export default class RutGeneratorExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new RutIndicator(this.metadata.name, this._settings, this.dir.get_child('icons'));
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
    }
}
