import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export declare class ImgSrcStyleBuilder extends StyleBuilder {
    buildStyles(url: string): {
        content: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ImgSrcStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImgSrcStyleBuilder>;
}
export declare class ImgSrcDirective extends BaseDirective2 {
    protected platformId: Object;
    protected serverModuleLoaded: boolean;
    protected DIRECTIVE_KEY: string;
    protected defaultSrc: string;
    set src(val: string);
    constructor(elementRef: ElementRef, styleBuilder: ImgSrcStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller, platformId: Object, serverModuleLoaded: boolean);
    /**
     * Use the [responsively] activated input value to update
     * the host img src attribute or assign a default `img.src=''`
     * if the src has not been defined.
     *
     * Do nothing to standard `<img src="">` usages, only when responsive
     * keys are present do we actually call `setAttribute()`
     */
    protected updateWithValue(value?: string): void;
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImgSrcDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ImgSrcDirective, never, never, { "src": { "alias": "src"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * This directive provides a responsive API for the HTML <img> 'src' attribute
 * and will update the img.src property upon each responsive activation.
 *
 * e.g.
 *      <img src="defaultScene.jpg" src.xs="mobileScene.jpg"></img>
 *
 * @see https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-src/
 */
export declare class DefaultImgSrcDirective extends ImgSrcDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultImgSrcDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultImgSrcDirective, "  img[src.xs],    img[src.sm],    img[src.md],    img[src.lg],   img[src.xl],  img[src.lt-sm], img[src.lt-md], img[src.lt-lg], img[src.lt-xl],  img[src.gt-xs], img[src.gt-sm], img[src.gt-md], img[src.gt-lg]", never, { "src.xs": { "alias": "src.xs"; "required": false; }; "src.sm": { "alias": "src.sm"; "required": false; }; "src.md": { "alias": "src.md"; "required": false; }; "src.lg": { "alias": "src.lg"; "required": false; }; "src.xl": { "alias": "src.xl"; "required": false; }; "src.lt-sm": { "alias": "src.lt-sm"; "required": false; }; "src.lt-md": { "alias": "src.lt-md"; "required": false; }; "src.lt-lg": { "alias": "src.lt-lg"; "required": false; }; "src.lt-xl": { "alias": "src.lt-xl"; "required": false; }; "src.gt-xs": { "alias": "src.gt-xs"; "required": false; }; "src.gt-sm": { "alias": "src.gt-sm"; "required": false; }; "src.gt-md": { "alias": "src.gt-md"; "required": false; }; "src.gt-lg": { "alias": "src.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
