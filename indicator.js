// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import {RutMenu} from './menu.js';
import {Kind, formatRut, randomRut} from './rut.js';
import {Tooltip} from './tooltip.js';

const COPIED_TIMEOUT_MS = 1400;

// A capsule in the panel with three buttons: company RUT, person RUT and the format and history menu
export const RutIndicator = GObject.registerClass(
class RutIndicator extends PanelMenu.Button {
    _init(name, settings, iconsDir) {
        // No built-in menu: it would open on any click, and only the chevron must open it
        super._init(0.0, name, true);
        this.add_style_class_name('rut-indicator');

        this._settings = settings;
        this._copiedIcon = new Gio.FileIcon({file: iconsDir.get_child('check-green.svg')});
        this._tooltips = [];
        this._timeoutId = 0;

        const capsule = new St.BoxLayout({style_class: 'rut-capsule', y_align: Clutter.ActorAlign.CENTER});
        this.add_child(capsule);

        this._kindButtons = new Map();
        for (const [kind, file, tooltip] of [
            [Kind.COMPANY, 'company-symbolic.svg', _('Generate and copy a company RUT')],
            [Kind.PERSON, 'person-symbolic.svg', _('Generate and copy a person RUT')],
        ]) {
            const icon = new Gio.FileIcon({file: iconsDir.get_child(file)});
            const button = this._addButton(capsule, icon, tooltip, () => this._generate(kind));
            this._kindButtons.set(kind, {button, icon});
        }

        this._menuButton = this._addButton(capsule,
            new Gio.FileIcon({file: iconsDir.get_child('chevron-down-symbolic.svg')}),
            _('Format and history'), () => this._rutMenu.toggle());
        this._menuButton.add_style_class_name('rut-menu-button');

        this._rutMenu = new RutMenu(this, settings, this._copiedIcon);
        this._rutMenu.menu.connectObject('open-state-changed',
            (_menu, open) => (this._menuButton.checked = open), this);
    }

    _addButton(capsule, gicon, tooltip, action) {
        const button = new St.Button({
            style_class: 'rut-button',
            child: new St.Icon({gicon, style_class: 'rut-button-icon'}),
            accessible_name: tooltip,
            can_focus: true,
            track_hover: true,
        });
        capsule.add_child(button);

        const buttonTooltip = new Tooltip(button, tooltip);
        this._tooltips.push(buttonTooltip);
        button.connect('clicked', () => {
            buttonTooltip.hide();
            action();
        });
        return button;
    }

    _generate(kind) {
        const rut = randomRut(kind);
        const text = formatRut(rut.number, rut.digit, this._settings.get_string('rut-format'));
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text);
        this._rutMenu.add(rut);

        // Show the green check mark on the pressed button for a moment; pressing again restarts it
        this._setFlash(kind);
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, COPIED_TIMEOUT_MS, () => {
            this._timeoutId = 0;
            this._setFlash(null);
            return GLib.SOURCE_REMOVE;
        });
    }

    _setFlash(kind) {
        for (const [buttonKind, {button, icon}] of this._kindButtons)
            button.child.gicon = buttonKind === kind ? this._copiedIcon : icon;
    }

    destroy() {
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;

        this._rutMenu.menu.disconnectObject(this);
        this._rutMenu.destroy();
        this._tooltips.forEach(tooltip => tooltip.destroy());

        this._rutMenu = null;
        this._tooltips = null;
        this._kindButtons = null;
        this._menuButton = null;
        this._copiedIcon = null;
        this._settings = null;

        super.destroy();
    }
});
