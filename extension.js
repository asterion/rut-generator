// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.
//
// RUT Empresa: a top panel button that copies a random, valid Chilean company RUT to the clipboard.

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {RutIndicator} from './indicator.js';

export default class RutEmpresaExtension extends Extension {
    enable() {
        this._indicator = new RutIndicator(this.metadata.name, this.dir.get_child('icons'));
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
