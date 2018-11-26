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
        Dropzone.prototype.defaultOptions.dictInvalidFileType = 'ONGELDIG_BESTANDSTYPE';
        Dropzone.prototype.defaultOptions.dictFileTooBig = 'BESTAND_TE_GROOT';
        Dropzone.prototype.defaultOptions.dictResponseError = 'HTTP_FOUT_{{statusCode}}';

        this.param = this.param || 'file';
    }

    static get properties() {
        return {
            /**
             * URL waarnaar geupload moet worden.
             */
            url: String,
            /**
             * Een lijst van toegelaten extensies.
             */
            'toegelaten-extensies': Array,
            /**
             * Een lijst van toegelaten mimetypes.
             */
            'toegelaten-mimetypes': Array,
            /**
             * De maximum grootte van een bestand in bytes.
             */
            'maximum-grootte': Number,
            /**
             * Het veld in de multipart/form-data body waarin het bestand gestoken moet worden.
             */
            param: String
        };
    }

    /**
     * Configuratie van de dropzone na de eerste rendering.
     */
    firstUpdated() {
        const self = this;
        const element = this.shadowRoot.querySelector('#upload');
        this.dropzone = new Dropzone(element, {
            url: this.url,
            paramName: this.param,
            maxFilesize: this._dropzoneMaxFilesize(),
            acceptedFiles: this._dropzoneAcceptedFiles(),
            init: function () {
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
            naam: bestand.name,
            grootte: bestand.size,
            type: bestand.type,
            laatstGewijzigd: bestand.lastModified
        }
    }

    /**
     * Rendert het element.
     *
     * @return {TemplateResult}
     */
    render() {
        return html`
    		<link rel="stylesheet" type="text/css" href="css/basic.min.css">
    		<link rel="stylesheet" type="text/css" href="css/dropzone.min.css">
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
    		</style>
    		<div id="upload" class="dropzone"></div>
    	`;
    }
}

customElements.define('vo-upload', VoUpload);
