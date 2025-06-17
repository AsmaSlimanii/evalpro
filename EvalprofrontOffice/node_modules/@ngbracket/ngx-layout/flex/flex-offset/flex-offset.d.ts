/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, LayoutConfigOptions, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface FlexOffsetParent {
    layout: string;
    isRtl: boolean;
}
export declare class FlexOffsetStyleBuilder extends StyleBuilder {
    private _config;
    constructor(_config: LayoutConfigOptions);
    buildStyles(offset: string, parent: FlexOffsetParent): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexOffsetStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FlexOffsetStyleBuilder>;
}
/**
 * 'flex-offset' flexbox styling directive
 * Configures the 'margin-left' of the element in a layout container
 */
export declare class FlexOffsetDirective extends BaseDirective2 implements OnChanges {
    protected directionality: Directionality;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, directionality: Directionality, styleBuilder: FlexOffsetStyleBuilder, marshal: MediaMarshaller, styler: StyleUtils);
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     */
    protected updateWithValue(value?: string | number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexOffsetDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlexOffsetDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultFlexOffsetDirective extends FlexOffsetDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultFlexOffsetDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultFlexOffsetDirective, "  [fxFlexOffset], [fxFlexOffset.xs], [fxFlexOffset.sm], [fxFlexOffset.md],  [fxFlexOffset.lg], [fxFlexOffset.xl], [fxFlexOffset.lt-sm], [fxFlexOffset.lt-md],  [fxFlexOffset.lt-lg], [fxFlexOffset.lt-xl], [fxFlexOffset.gt-xs], [fxFlexOffset.gt-sm],  [fxFlexOffset.gt-md], [fxFlexOffset.gt-lg]", never, { "fxFlexOffset": { "alias": "fxFlexOffset"; "required": false; }; "fxFlexOffset.xs": { "alias": "fxFlexOffset.xs"; "required": false; }; "fxFlexOffset.sm": { "alias": "fxFlexOffset.sm"; "required": false; }; "fxFlexOffset.md": { "alias": "fxFlexOffset.md"; "required": false; }; "fxFlexOffset.lg": { "alias": "fxFlexOffset.lg"; "required": false; }; "fxFlexOffset.xl": { "alias": "fxFlexOffset.xl"; "required": false; }; "fxFlexOffset.lt-sm": { "alias": "fxFlexOffset.lt-sm"; "required": false; }; "fxFlexOffset.lt-md": { "alias": "fxFlexOffset.lt-md"; "required": false; }; "fxFlexOffset.lt-lg": { "alias": "fxFlexOffset.lt-lg"; "required": false; }; "fxFlexOffset.lt-xl": { "alias": "fxFlexOffset.lt-xl"; "required": false; }; "fxFlexOffset.gt-xs": { "alias": "fxFlexOffset.gt-xs"; "required": false; }; "fxFlexOffset.gt-sm": { "alias": "fxFlexOffset.gt-sm"; "required": false; }; "fxFlexOffset.gt-md": { "alias": "fxFlexOffset.gt-md"; "required": false; }; "fxFlexOffset.gt-lg": { "alias": "fxFlexOffset.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
