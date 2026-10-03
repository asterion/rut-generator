// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const SHOW_DELAY_MS = 500;
const GAP = 6;

// The panel has no tooltips of its own: this shows a label under an actor while it is hovered,
// with the same look as the labels of the dash.
export class Tooltip {
    constructor(actor, text) {
        this._actor = actor;
        this._timeoutId = 0;

        this._label = new St.Label({style_class: 'dash-label', text, visible: false});
        Main.uiGroup.add_child(this._label);

        this._actor.connectObject('notify::hover', () => this._syncHover(), this);
    }

    hide() {
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;
        this._label.hide();
    }

    _syncHover() {
        if (!this._actor.hover) {
            this.hide();
            return;
        }

        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SHOW_DELAY_MS, () => {
            this._timeoutId = 0;
            this._show();
            return GLib.SOURCE_REMOVE;
        });
    }

    _show() {
        const [x, y] = this._actor.get_transformed_position();
        const [width, height] = this._actor.get_transformed_size();
        const monitor = Main.layoutManager.findMonitorForActor(this._actor);

        this._label.show();
        const labelWidth = this._label.width;
        const labelX = Math.clamp(x + (width - labelWidth) / 2, monitor.x, monitor.x + monitor.width - labelWidth);
        this._label.set_position(Math.floor(labelX), Math.floor(y + height + GAP));
    }

    destroy() {
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;

        this._actor.disconnectObject(this);
        this._label.destroy();

        this._actor = null;
        this._label = null;
    }
}
