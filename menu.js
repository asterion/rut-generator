// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Kind, formatRut} from './rut.js';

const COPIED_TIMEOUT_MS = 1400;
// Secondary text (samples, kinds) is dimmed instead of colored, so it works with any theme
const DIM_OPACITY = 160;
const SAMPLE_NUMBER = 12345678;
const SAMPLE_DIGIT = '5';

// A menu item that runs its action without closing the menu: emitting 'activate' would close it
const StayOpenItem = GObject.registerClass(
class StayOpenItem extends PopupMenu.PopupBaseMenuItem {
    _init(action) {
        super._init();
        this._action = action;
    }

    activate() {
        this._action();
    }

    destroy() {
        this._action = null;
        super.destroy();
    }
});

function dimLabel(text, styleClass) {
    return new St.Label({text, style_class: styleClass, opacity: DIM_OPACITY, y_align: Clutter.ActorAlign.CENTER});
}

function headerItem(text) {
    return new PopupMenu.PopupMenuItem(text, {reactive: false, can_focus: false, style_class: 'rut-menu-header'});
}

// The drop-down menu: RUT format choice and the history of generated RUTs
export class RutMenu {
    constructor(sourceActor, settings, copyIcon) {
        this._settings = settings;
        this._copyIcon = copyIcon;
        this._history = [];
        this._nextId = 0;
        this._copiedId = null;
        this._checkIcons = new Map();
        this._timeoutId = 0;

        this.menu = new PopupMenu.PopupMenu(sourceActor, 0.0, St.Side.TOP);
        this.menu.box.add_style_class_name('rut-menu');
        Main.uiGroup.add_child(this.menu.actor);
        this.menu.actor.hide();
        Main.panel.menuManager.addMenu(this.menu);

        this.menu.addMenuItem(headerItem(_('Format')));
        this._formatItems = new Map();
        for (const [format, label] of [
            ['dots', _('With dots and dash')],
            ['dash', _('Dash only')],
            ['plain', _('No dots or dash')],
        ]) {
            const item = new StayOpenItem(() => this._settings.set_string('rut-format', format));
            item.add_child(new St.Label({text: label, x_expand: true, y_align: Clutter.ActorAlign.CENTER}));
            item.add_child(dimLabel(formatRut(SAMPLE_NUMBER, SAMPLE_DIGIT, format), 'rut-menu-number'));
            this.menu.addMenuItem(item);
            this._formatItems.set(format, item);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(headerItem(_('History')));
        this._historySection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._historySection);

        // Kept outside the history section, which is rebuilt, so it is never destroyed while clicked
        this._clearSeparator = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(this._clearSeparator);
        this._clearItem = new StayOpenItem(() => {
            this._history = [];
            this._rebuildHistory();
        });
        this._clearItem.add_child(new St.Label({text: _('Clear history')}));
        this.menu.addMenuItem(this._clearItem);

        this._settings.connectObject(
            'changed::rut-format', () => this._syncFormat(),
            'changed::history-limit', () => this._trimHistory(),
            this);
        this._syncFormat();
    }

    toggle() {
        this.menu.toggle();
    }

    // Add a RUT that was just generated and copied
    add(rut) {
        const id = this._nextId++;
        this._history.unshift({id, ...rut});
        this._trimHistory();
        this._flash(id);
    }

    _syncFormat() {
        const current = this._settings.get_string('rut-format');
        for (const [format, item] of this._formatItems)
            item.setOrnament(format === current ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NO_DOT);

        // The history is always shown in the current format
        this._rebuildHistory();
    }

    _trimHistory() {
        this._history.length = Math.min(this._history.length, this._settings.get_int('history-limit'));
        this._rebuildHistory();
    }

    _rebuildHistory() {
        this._historySection.removeAll();
        this._checkIcons.clear();

        const hasHistory = this._history.length > 0;
        this._clearSeparator.visible = hasHistory;
        this._clearItem.visible = hasHistory;

        if (!hasHistory) {
            this._historySection.addMenuItem(new PopupMenu.PopupMenuItem(_('No RUTs generated'), {reactive: false}));
            return;
        }

        const format = this._settings.get_string('rut-format');
        for (const entry of this._history) {
            const text = formatRut(entry.number, entry.digit, format);
            const item = new StayOpenItem(() => {
                St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text);
                this._flash(entry.id);
            });

            item.add_child(dimLabel(entry.kind === Kind.COMPANY ? _('Company') : _('Person'), 'rut-history-kind'));
            item.add_child(new St.Label({
                text,
                style_class: 'rut-menu-number',
                x_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
            }));

            const check = new St.Icon({
                gicon: this._copyIcon,
                style_class: 'rut-history-check',
                visible: entry.id === this._copiedId,
            });
            item.add_child(check);
            this._checkIcons.set(entry.id, check);

            this._historySection.addMenuItem(item);
        }
    }

    // Show the check mark next to a history entry for a moment
    _flash(id) {
        this._setCopied(id);
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, COPIED_TIMEOUT_MS, () => {
            this._timeoutId = 0;
            this._setCopied(null);
            return GLib.SOURCE_REMOVE;
        });
    }

    _setCopied(id) {
        this._checkIcons.get(this._copiedId)?.hide();
        this._copiedId = id;
        this._checkIcons.get(id)?.show();
    }

    destroy() {
        if (this._timeoutId)
            GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;

        this._settings.disconnectObject(this);

        // Also removes it from the panel's menu manager
        this.menu.destroy();

        this.menu = null;
        this._settings = null;
        this._copyIcon = null;
        this._formatItems = null;
        this._historySection = null;
        this._clearSeparator = null;
        this._clearItem = null;
        this._checkIcons = null;
        this._history = null;
    }
}
