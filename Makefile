UUID = rut-generator@asterion
DOMAIN = $(UUID)
LANGS = $(basename $(notdir $(wildcard po/*.po)))
MO_FILES = $(foreach l,$(LANGS),locale/$(l)/LC_MESSAGES/$(DOMAIN).mo)

.PHONY: all pot pack clean

# Compile the settings schema and translations (needed when running from the symlinked folder)
all: schemas/gschemas.compiled $(MO_FILES)

schemas/gschemas.compiled: schemas/*.gschema.xml
	glib-compile-schemas schemas

locale/%/LC_MESSAGES/$(DOMAIN).mo: po/%.po
	mkdir -p $(dir $@)
	msgfmt --check -o $@ $<

# Regenerate the template and merge new strings into the .po files
pot:
	xgettext --from-code=UTF-8 --language=JavaScript --add-comments=Translators \
		--keyword=_ --package-name=$(DOMAIN) -o po/$(DOMAIN).pot *.js
	for po in po/*.po; do msgmerge --update --backup=none $$po po/$(DOMAIN).pot; done

# Build the zip for extensions.gnome.org (compiles the schema and .po files itself)
pack:
	gnome-extensions pack --force --podir=po \
		--extra-source=indicator.js --extra-source=menu.js --extra-source=tooltip.js --extra-source=rut.js \
		--extra-source=icons --extra-source=LICENSE .

clean:
	rm -rf locale schemas/gschemas.compiled $(UUID).shell-extension.zip
