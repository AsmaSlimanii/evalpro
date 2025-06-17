/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, ElementMatcher, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface LayoutAlignParent {
    layout: string;
    inline: boolean;
}
export declare class LayoutAlignStyleBuilder extends StyleBuilder {
    buildStyles(align: string, parent: LayoutAlignParent): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutAlignStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LayoutAlignStyleBuilder>;
}
/**
 * 'layout-align' flexbox styling directive
 *  Defines positioning of child elements along main and cross axis in a layout container
 *  Optional values: {main-axis} values or {main-axis cross-axis} value pairs
 *
 *  @see https://css-tricks.com/almanac/properties/j/justify-content/
 *  @see https://css-tricks.com/almanac/properties/a/align-items/
 *  @see https://css-tricks.com/almanac/properties/a/align-content/
 */
export declare class LayoutAlignDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    protected layout: string;
    protected inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: LayoutAlignStyleBuilder, marshal: MediaMarshaller);
    /**
     *
     */
    protected updateWithValue(value: string): void;
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutAlignDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LayoutAlignDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultLayoutAlignDirective extends LayoutAlignDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultLayoutAlignDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultLayoutAlignDirective, "  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]", never, { "fxLayoutAlign": { "alias": "fxLayoutAlign"; "required": false; }; "fxLayoutAlign.xs": { "alias": "fxLayoutAlign.xs"; "required": false; }; "fxLayoutAlign.sm": { "alias": "fxLayoutAlign.sm"; "required": false; }; "fxLayoutAlign.md": { "alias": "fxLayoutAlign.md"; "required": false; }; "fxLayoutAlign.lg": { "alias": "fxLayoutAlign.lg"; "required": false; }; "fxLayoutAlign.xl": { "alias": "fxLayoutAlign.xl"; "required": false; }; "fxLayoutAlign.lt-sm": { "alias": "fxLayoutAlign.lt-sm"; "required": false; }; "fxLayoutAlign.lt-md": { "alias": "fxLayoutAlign.lt-md"; "required": false; }; "fxLayoutAlign.lt-lg": { "alias": "fxLayoutAlign.lt-lg"; "required": false; }; "fxLayoutAlign.lt-xl": { "alias": "fxLayoutAlign.lt-xl"; "required": false; }; "fxLayoutAlign.gt-xs": { "alias": "fxLayoutAlign.gt-xs"; "required": false; }; "fxLayoutAlign.gt-sm": { "alias": "fxLayoutAlign.gt-sm"; "required": false; }; "fxLayoutAlign.gt-md": { "alias": "fxLayoutAlign.gt-md"; "required": false; }; "fxLayoutAlign.gt-lg": { "alias": "fxLayoutAlign.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
