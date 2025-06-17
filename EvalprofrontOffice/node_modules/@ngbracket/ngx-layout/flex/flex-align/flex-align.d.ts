/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export declare class FlexAlignStyleBuilder extends StyleBuilder {
    buildStyles(input: string): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexAlignStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FlexAlignStyleBuilder>;
}
/**
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
export declare class FlexAlignDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexAlignStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexAlignDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlexAlignDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultFlexAlignDirective extends FlexAlignDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultFlexAlignDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultFlexAlignDirective, "  [fxFlexAlign], [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md],  [fxFlexAlign.lg], [fxFlexAlign.xl], [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md],  [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl], [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm],  [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]", never, { "fxFlexAlign": { "alias": "fxFlexAlign"; "required": false; }; "fxFlexAlign.xs": { "alias": "fxFlexAlign.xs"; "required": false; }; "fxFlexAlign.sm": { "alias": "fxFlexAlign.sm"; "required": false; }; "fxFlexAlign.md": { "alias": "fxFlexAlign.md"; "required": false; }; "fxFlexAlign.lg": { "alias": "fxFlexAlign.lg"; "required": false; }; "fxFlexAlign.xl": { "alias": "fxFlexAlign.xl"; "required": false; }; "fxFlexAlign.lt-sm": { "alias": "fxFlexAlign.lt-sm"; "required": false; }; "fxFlexAlign.lt-md": { "alias": "fxFlexAlign.lt-md"; "required": false; }; "fxFlexAlign.lt-lg": { "alias": "fxFlexAlign.lt-lg"; "required": false; }; "fxFlexAlign.lt-xl": { "alias": "fxFlexAlign.lt-xl"; "required": false; }; "fxFlexAlign.gt-xs": { "alias": "fxFlexAlign.gt-xs"; "required": false; }; "fxFlexAlign.gt-sm": { "alias": "fxFlexAlign.gt-sm"; "required": false; }; "fxFlexAlign.gt-md": { "alias": "fxFlexAlign.gt-md"; "required": false; }; "fxFlexAlign.gt-lg": { "alias": "fxFlexAlign.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
