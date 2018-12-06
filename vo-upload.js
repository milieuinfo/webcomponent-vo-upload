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
        Dropzone.prototype.defaultOptions.dictCancelUpload = '';
        Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = 'Ben je zeker dat je deze oplading wilt annuleren?';
        Dropzone.prototype.defaultOptions.dictRemoveFile = '';
        Dropzone.prototype.defaultOptions.dictInvalidFileType = 'ONGELDIG_BESTANDSTYPE';
        Dropzone.prototype.defaultOptions.dictFileTooBig = 'BESTAND_TE_GROOT';
        Dropzone.prototype.defaultOptions.dictResponseError = 'HTTP_FOUT_{{statusCode}}';

        this.param = this.param || 'file';
    }

    /**
     * Geeft al de properties.
     * 
     * @return {Object}
     */
    static get properties() {
        return {
            /**
             * URL waarnaar geupload moet worden.
             */
            url: {
            	type: String
            },
            /**
             * Bericht dat getoond wordt in de upload component. Standaard bericht is: `Sleep bestanden naar hier om op te laden`.
             */
            bericht: {
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
     * 
     * @Return {void}
     */
    firstUpdated() {
        const self = this;
        
        if (this.bericht) {
        	Dropzone.prototype.defaultOptions.dictDefaultMessage = this.bericht;
        }

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
                    self._truncateBestandenInQueue();
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
    
    /**
     * Geeft het aantal bestanden dat in de queue staat om opgeladen te worden.
     * 
     * @return {Number}
     */
    getNumberOfQueuedFiles() {
    	return this._dropzone.getQueuedFiles().length;
    }

    _truncateBestandenInQueue() {
        const maxBestanden = this['maximum-aantal-bestanden'];
        if(maxBestanden) {
            const bestandenInQueue = this._dropzone.files;
            bestandenInQueue.slice(0, Math.max(0, bestandenInQueue.length - maxBestanden)).forEach((file) => {
                this._dropzone.removeFile(file);
            });
        }
    }

    /**
     * Berekent de maximum bestand grootte.
     * 
     * @return {Number}
     */
    _dropzoneMaxFilesize() {
        return this['maximum-grootte'] / 1024 / 1024
    }

    /**
     * Genereert een array die de toegelaten bestand types bepaalt.
     * 
     * @return {Array}
     */
    _dropzoneAcceptedFiles() {
        if (this['toegelaten-extensies'] || this['toegelaten-mimetypes']) {
            return []
                .concat((this['toegelaten-extensies'] || []).map((extensie) => "." + extensie))
                .concat(this['toegelaten-mimetypes'] || [])
                .join(',');
        } else {
            return null;
        }
    }

    /**
     * Gooit een vo-upload event.
     * 
     * @return {void}
     */
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
     * 
     * @return {void}
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
    		<style>
    			.dropzone,.dropzone *{box-sizing:border-box}.dropzone{position:relative}.dropzone .dz-preview{position:relative;display:inline-block;width:120px;margin:0.5em}.dropzone .dz-preview .dz-progress{display:block;height:15px;border:1px solid #aaa}.dropzone .dz-preview .dz-progress .dz-upload{display:block;height:100%;width:0;background:green}.dropzone .dz-preview .dz-error-message{color:red;display:none}.dropzone .dz-preview.dz-error .dz-error-message,.dropzone .dz-preview.dz-error .dz-error-mark{display:block}.dropzone .dz-preview.dz-success .dz-success-mark{display:block}.dropzone .dz-preview .dz-error-mark,.dropzone .dz-preview .dz-success-mark{position:absolute;display:none;left:30px;top:30px;width:54px;height:58px;left:50%;margin-left:-27px}
        		@-webkit-keyframes passing-through{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%, 70%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}100%{opacity:0;-webkit-transform:translateY(-40px);-moz-transform:translateY(-40px);-ms-transform:translateY(-40px);-o-transform:translateY(-40px);transform:translateY(-40px)}}@-moz-keyframes passing-through{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%, 70%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}100%{opacity:0;-webkit-transform:translateY(-40px);-moz-transform:translateY(-40px);-ms-transform:translateY(-40px);-o-transform:translateY(-40px);transform:translateY(-40px)}}@keyframes passing-through{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%, 70%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}100%{opacity:0;-webkit-transform:translateY(-40px);-moz-transform:translateY(-40px);-ms-transform:translateY(-40px);-o-transform:translateY(-40px);transform:translateY(-40px)}}@-webkit-keyframes slide-in{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}}@-moz-keyframes slide-in{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}}@keyframes slide-in{0%{opacity:0;-webkit-transform:translateY(40px);-moz-transform:translateY(40px);-ms-transform:translateY(40px);-o-transform:translateY(40px);transform:translateY(40px)}30%{opacity:1;-webkit-transform:translateY(0px);-moz-transform:translateY(0px);-ms-transform:translateY(0px);-o-transform:translateY(0px);transform:translateY(0px)}}@-webkit-keyframes pulse{0%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}10%{-webkit-transform:scale(1.1);-moz-transform:scale(1.1);-ms-transform:scale(1.1);-o-transform:scale(1.1);transform:scale(1.1)}20%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}}@-moz-keyframes pulse{0%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}10%{-webkit-transform:scale(1.1);-moz-transform:scale(1.1);-ms-transform:scale(1.1);-o-transform:scale(1.1);transform:scale(1.1)}20%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}}@keyframes pulse{0%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}10%{-webkit-transform:scale(1.1);-moz-transform:scale(1.1);-ms-transform:scale(1.1);-o-transform:scale(1.1);transform:scale(1.1)}20%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1)}}.dropzone,.dropzone *{box-sizing:border-box}.dropzone{min-height:150px;border:2px solid rgba(0,0,0,0.3);background:white;padding:20px 20px}.dropzone.dz-clickable{cursor:pointer}.dropzone.dz-clickable *{cursor:default}.dropzone.dz-clickable .dz-message,.dropzone.dz-clickable .dz-message *{cursor:pointer}.dropzone.dz-started .dz-message{display:none}.dropzone.dz-drag-hover{border-style:solid}.dropzone.dz-drag-hover .dz-message{opacity:0.5}.dropzone .dz-message{text-align:center;margin:2em 0}.dropzone .dz-preview{position:relative;display:inline-block;vertical-align:top;margin:16px;min-height:100px}.dropzone .dz-preview:hover{z-index:1000}.dropzone .dz-preview:hover .dz-details{opacity:1}.dropzone .dz-preview.dz-file-preview .dz-image{border-radius:20px;background:#999;background:linear-gradient(to bottom, #eee, #ddd)}.dropzone .dz-preview.dz-file-preview .dz-details{opacity:1}.dropzone .dz-preview.dz-image-preview{background:white}.dropzone .dz-preview.dz-image-preview .dz-details{-webkit-transition:opacity 0.2s linear;-moz-transition:opacity 0.2s linear;-ms-transition:opacity 0.2s linear;-o-transition:opacity 0.2s linear;transition:opacity 0.2s linear}.dropzone .dz-preview .dz-remove{font-size:14px;text-align:center;display:block;cursor:pointer;border:none}.dropzone .dz-preview .dz-remove:hover{text-decoration:underline}.dropzone .dz-preview:hover .dz-details{opacity:1}.dropzone .dz-preview .dz-details{z-index:20;position:absolute;top:0;left:0;opacity:0;font-size:13px;min-width:100%;max-width:100%;padding:2em 1em;text-align:center;color:rgba(0,0,0,0.9);line-height:150%}.dropzone .dz-preview .dz-details .dz-size{margin-bottom:1em;font-size:16px}.dropzone .dz-preview .dz-details .dz-filename{white-space:nowrap}.dropzone .dz-preview .dz-details .dz-filename:hover span{border:1px solid rgba(200,200,200,0.8);background-color:rgba(255,255,255,0.8)}.dropzone .dz-preview .dz-details .dz-filename:not(:hover){overflow:hidden;text-overflow:ellipsis}.dropzone .dz-preview .dz-details .dz-filename:not(:hover) span{border:1px solid transparent}.dropzone .dz-preview .dz-details .dz-filename span,.dropzone .dz-preview .dz-details .dz-size span{background-color:rgba(255,255,255,0.4);padding:0 0.4em;border-radius:3px}.dropzone .dz-preview:hover .dz-image img{-webkit-transform:scale(1.05, 1.05);-moz-transform:scale(1.05, 1.05);-ms-transform:scale(1.05, 1.05);-o-transform:scale(1.05, 1.05);transform:scale(1.05, 1.05);-webkit-filter:blur(8px);filter:blur(8px)}.dropzone .dz-preview .dz-image{border-radius:20px;overflow:hidden;width:120px;height:120px;position:relative;display:block;z-index:10}.dropzone .dz-preview .dz-image img{display:block}.dropzone .dz-preview.dz-success .dz-success-mark{-webkit-animation:passing-through 3s cubic-bezier(0.77, 0, 0.175, 1);-moz-animation:passing-through 3s cubic-bezier(0.77, 0, 0.175, 1);-ms-animation:passing-through 3s cubic-bezier(0.77, 0, 0.175, 1);-o-animation:passing-through 3s cubic-bezier(0.77, 0, 0.175, 1);animation:passing-through 3s cubic-bezier(0.77, 0, 0.175, 1)}.dropzone .dz-preview.dz-error .dz-error-mark{opacity:1;-webkit-animation:slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);-moz-animation:slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);-ms-animation:slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);-o-animation:slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);animation:slide-in 3s cubic-bezier(0.77, 0, 0.175, 1)}.dropzone .dz-preview .dz-success-mark,.dropzone .dz-preview .dz-error-mark{pointer-events:none;opacity:0;z-index:500;position:absolute;display:block;top:50%;left:50%;margin-left:-27px;margin-top:-27px}.dropzone .dz-preview .dz-success-mark svg,.dropzone .dz-preview .dz-error-mark svg{display:block;width:54px;height:54px}.dropzone .dz-preview.dz-processing .dz-progress{opacity:1;-webkit-transition:all 0.2s linear;-moz-transition:all 0.2s linear;-ms-transition:all 0.2s linear;-o-transition:all 0.2s linear;transition:all 0.2s linear}.dropzone .dz-preview.dz-complete .dz-progress{opacity:0;-webkit-transition:opacity 0.4s ease-in;-moz-transition:opacity 0.4s ease-in;-ms-transition:opacity 0.4s ease-in;-o-transition:opacity 0.4s ease-in;transition:opacity 0.4s ease-in}.dropzone .dz-preview:not(.dz-processing) .dz-progress{-webkit-animation:pulse 6s ease infinite;-moz-animation:pulse 6s ease infinite;-ms-animation:pulse 6s ease infinite;-o-animation:pulse 6s ease infinite;animation:pulse 6s ease infinite}.dropzone .dz-preview .dz-progress{opacity:1;z-index:1000;pointer-events:none;position:absolute;height:16px;left:50%;top:50%;margin-top:-8px;width:80px;margin-left:-40px;background:rgba(255,255,255,0.9);-webkit-transform:scale(1);border-radius:8px;overflow:hidden}.dropzone .dz-preview .dz-progress .dz-upload{background:#333;background:linear-gradient(to bottom, #666, #444);position:absolute;top:0;left:0;bottom:0;width:0;-webkit-transition:width 300ms ease-in-out;-moz-transition:width 300ms ease-in-out;-ms-transition:width 300ms ease-in-out;-o-transition:width 300ms ease-in-out;transition:width 300ms ease-in-out}.dropzone .dz-preview.dz-error .dz-error-message{display:block}.dropzone .dz-preview.dz-error:hover .dz-error-message{opacity:1;pointer-events:auto}.dropzone .dz-preview .dz-error-message{pointer-events:none;z-index:1000;position:absolute;display:block;display:none;opacity:0;-webkit-transition:opacity 0.3s ease;-moz-transition:opacity 0.3s ease;-ms-transition:opacity 0.3s ease;-o-transition:opacity 0.3s ease;transition:opacity 0.3s ease;border-radius:8px;font-size:13px;top:130px;left:-10px;width:140px;background:#be2626;background:linear-gradient(to bottom, #be2626, #a92222);padding:0.5em 1.2em;color:white}.dropzone .dz-preview .dz-error-message:after{content:'';position:absolute;top:-6px;left:64px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid #be2626}
    		
    			:host {
    				display: block;
    			}
    		
    			#upload {
    				color: rgb(116, 116, 116);
    				border: 1px solid rgba(116, 116, 116, 0.2);
    				min-height: 194px;
    			}
    			
    			#upload .dz-preview:not(.dz-processing) .dz-progress {
    				display: none;
    			}
    			
    			#upload .dz-preview.dz-success .dz-success-mark {
    				opacity: 0.6;
    			}
    			
    			#upload .dz-image {
    				border-radius: 0px;
    				border: 1px solid rgba(116, 116, 116, 0.2);
    			}
    			
    			#upload .dz-error-message {
    			    display: none;
    			}
    			
    			#upload .dz-remove {
    				position: absolute;
    				top: 5px;
    				right: 5px;
    				padding: 5px;
    				background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns' width='15px' height='15px' viewBox='0 0 54 54'><g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'><g id='Check-+-Oval-2' sketch:type='MSLayerGroup' stroke='#FBE6E6' stroke-opacity='0.198794158' fill='#DB3434' fill-opacity='0.816519475'><path d='M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z'/></g></g></svg>");
    				z-index: 100;
    				cursor: pointer;
    				width: 15px;
    				height: 15px;
    			}
    			
    			#upload .dz-remove:hover {
        			background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns' width='15px' height='15px' viewBox='0 0 54 54'><g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'><g id='Check-+-Oval-2' sketch:type='MSLayerGroup' stroke='#FBE6E6' stroke-opacity='0.198794158' fill='#A70200' fill-opacity='0.816519475'><path d='M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z'/></g></g></svg>");
    			}
    		</style>
    		<div id="upload" class="dropzone"></div>
    	`;
    }
}

customElements.define('vo-upload', VoUpload);
