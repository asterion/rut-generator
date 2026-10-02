// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.
//
// RUT Empresa: two top panel buttons that copy a random, valid Chilean RUT to the clipboard,
// one for a company and one for a person.

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {RutIndicator} from './indicator.js';
import {randomCompanyRut, randomPersonRut} from './rut.js';

export default class RutEmpresaExtension extends Extension {
    enable() {
        const icons = this.dir.get_child('icons');

        // Translators: accessible name of the company button, read by screen readers
        this._companyIndicator = new RutIndicator(_('Copy a random company RUT'),
            icons.get_child('company-symbolic.svg'), randomCompanyRut);
        // Translators: accessible name of the person button, read by screen readers
        this._personIndicator = new RutIndicator(_('Copy a random person RUT'),
            icons.get_child('person-symbolic.svg'), randomPersonRut);

        // Side by side: the company first, the person right after it
        Main.panel.addToStatusArea(this.uuid, this._companyIndicator, 0);
        Main.panel.addToStatusArea(`${this.uuid}-person`, this._personIndicator, 1);
    }

    disable() {
        this._companyIndicator.destroy();
        this._companyIndicator = null;
        this._personIndicator.destroy();
        this._personIndicator = null;
    }
}
