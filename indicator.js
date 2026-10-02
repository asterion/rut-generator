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

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import {randomCompanyRut} from './rut.js';

const COPIED_TIMEOUT_MS = 1000;

export const RutIndicator = GObject.registerClass(
class RutIndicator extends PanelMenu.Button {
    _init(name, iconsDir) {
        super._init(0.0, name, true);

        this._companyIcon = new Gio.FileIcon({file: iconsDir.get_child('company-symbolic.svg')});
        this._copiedIcon = new Gio.ThemedIcon({name: 'object-select-symbolic'});
        this._timeoutId = 0;

        this._icon = new St.Icon({
            gicon: this._companyIcon,
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);
    }

    vfunc_event(event) {
        const type = event.type();
        if (type === Clutter.EventType.BUTTON_PRESS || type === Clutter.EventType.TOUCH_BEGIN)
            this._copyRut();

        return Clutter.EVENT_PROPAGATE;
    }

    _copyRut() {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, randomCompanyRut());

        // Show a check mark for a moment to confirm the copy
        this._icon.gicon = this._copiedIcon;
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, COPIED_TIMEOUT_MS, () => {
            this._timeoutId = 0;
            this._icon.gicon = this._companyIcon;
            return GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;

        this._icon = null;
        this._companyIcon = null;
        this._copiedIcon = null;

        super.destroy();
    }
});
