import {LitElement, html} from '../../node_modules/vodomg-litelement/@polymer/lit-element/lit-element.js';
import '../../node_modules/dropzone/dist/dropzone.js';

/**
 * `vo-upload`
 * De upload component voor gebruik in websites en applicaties van de Vlaamse overheid
 *
 * ### Events
 *
 * De volgende events zijn beschikbaar:
 *
 * Event | Uitleg | Detail object
 * ------|-------------|--------------
 * `vo-upload-bestand-toegevoegd` | Wordt afgevuurd wanneer er een bestand werd toegevoegd. | { bestand }
 * `vo-upload-bestand-verwijderd` | Wordt afgevuurd wanneer er een bestand werd verwijderd. | { bestand }
 * `vo-upload-versturen` | Wordt afgevuurd vlak voordat het bestand verstuurd wordt naar de url. | { bestand }
 * `vo-upload-succes` | Wordt afgevuurd wanneer een bestand succesvol werd opgeladen. | { bestand, response }
 * `vo-upload-fout` | Wordt afgevuurd wanneer een bestand niet kon opgeladen worden vanwege een fout. | { bestand, fout }
 *
 * @customElement
 * @polymer
 * @demo demo/vo-upload.html
 */
class VoUpload extends LitElement {
    /**
     * Constructor.
     */
    constructor() {
        super();
        Dropzone.autoDiscover = false;
        Dropzone.prototype.defaultOptions.dictDefaultMessage = 'Sleep bestanden naar hier om op te laden';
        Dropzone.prototype.defaultOptions.dictCancelUpload = 'Annuleer oplading';
        Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = 'Ben je zeker dat je deze oplading wilt annuleren?';
        Dropzone.prototype.defaultOptions.dictRemoveFile = 'Verwijder bestand';
        Dropzone.prototype.defaultOptions.dictInvalidFileType = 'ONGELDIG_BESTANDSTYPE';
        Dropzone.prototype.defaultOptions.dictFileTooBig = 'BESTAND_TE_GROOT';
        Dropzone.prototype.defaultOptions.dictResponseError = 'HTTP_FOUT_{{statusCode}}';

        this.param = this.param || 'file';
        this['auto-upload'] = this['auto-upload'] !== undefined;
    }

    static get properties() {
        return {
            /**
             * URL waarnaar geupload moet worden.
             */
            url: {
            	type: String
            },
            /**
             * Een lijst van toegelaten extensies.
             */
            'toegelaten-extensies': {
            	type: Array
            },
            /**
             * Een lijst van toegelaten mimetypes.
             */
            'toegelaten-mimetypes': {
            	type: Array
            },
            /**
             * De maximum grootte van een bestand in bytes.
             */
            'maximum-grootte': {
            	type: Number
            },
            /**
             * Het veld in de multipart/form-data body waarin het bestand gestoken moet worden.
             */
            param: {
            	type: String
            },
            /**
             * Het maximum aantal bestanden dat men mag uploaden.
             */
            'maximum-aantal-bestanden': {
            	type: Number
            },
            /**
             * Bepaalt of er automatisch geupload moet worden.
             */
            'auto-upload': {
            	type: Boolean
            }
        };
    }

    /**
     * Configuratie van de dropzone na de eerste rendering.
     */
    firstUpdated() {
        const self = this;
        const element = this.shadowRoot.querySelector('#upload');
        this._dropzone = new Dropzone(element, {
            url: this.url,
            paramName: this.param,
            maxFilesize: this._dropzoneMaxFilesize(),
            acceptedFiles: this._dropzoneAcceptedFiles(),
            addRemoveLinks: true,
            maxFiles: this['maximum-aantal-bestanden'],
            autoProcessQueue: this['auto-upload'],
            init: function () {
                this.on('addedfile', function(bestand) {
                    self._fireEvent('bestand-toegevoegd', { bestand: VoUpload._dropzoneBestandNaarVoUploadBestand(bestand) });
                });

                this.on('removedfile', function(bestand) {
                    self._fireEvent('bestand-verwijderd', { bestand: VoUpload._dropzoneBestandNaarVoUploadBestand(bestand) });
                });

                this.on('sending', function(bestand) {
                    self._fireEvent('versturen', { bestand: VoUpload._dropzoneBestandNaarVoUploadBestand(bestand) });
                });

                this.on('success', function (bestand, response) {
                    self._fireEvent('succes', { bestand: VoUpload._dropzoneBestandNaarVoUploadBestand(bestand), response: response });
                });

                this.on('error', function (bestand, foutBoodschap) {
                    self._fireEvent('fout', { bestand: VoUpload._dropzoneBestandNaarVoUploadBestand(bestand), fout: foutBoodschap });
                });
            }
        });
    }

    _dropzoneMaxFilesize() {
        return this['maximum-grootte'] / 1024 / 1024
    }

    _dropzoneAcceptedFiles() {
        if (this['toegelaten-extensies'] || this['toegelaten-mimetypes']) {
            return [].concat(this['toegelaten-extensies']).concat(this['toegelaten-mimetypes']).filter((item) => item != null).join(',');
        } else {
            return null;
        }
    }

    _fireEvent(naam, data) {
        this.dispatchEvent(new CustomEvent('vo-upload-' + naam, {detail: data}));
    }

    static _dropzoneBestandNaarVoUploadBestand(bestand) {
        return {
            id: bestand.upload.uuid,
            naam: bestand.name,
            grootte: bestand.size,
            type: bestand.type,
            laatstGewijzigd: bestand.lastModified
        }
    }

    /**
     * Upload alle bestanden die de gebruiker geselecteerd heeft.
     */
    upload() {
        this._dropzone.processQueue();
    }

    /**
     * Rendert het element.
     *
     * @return {TemplateResult}
     */
    render() {
        return html`
    		<link rel="stylesheet" type="text/css" href="../node_modules/dropzone/dist/min/basic.min.css">
    		<link rel="stylesheet" type="text/css" href="../node_modules/dropzone/dist/min/dropzone.min.css">
    		<style>
    			:host {
    				display: block;
    			}
    		
    			#upload {
    				border: 1px solid rgb(51, 51, 51);
    			}
    			
    			#upload .dz-image {
    				border-radius: 0px;
    			}
    			
    			#upload .dz-error-message {
    			    display: none;
    			}
    		</style>
    		<div id="upload" class="dropzone"></div>
    	`;
    }
}

customElements.define('vo-upload', VoUpload);
