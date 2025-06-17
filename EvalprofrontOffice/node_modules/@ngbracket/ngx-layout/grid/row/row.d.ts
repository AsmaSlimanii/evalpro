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
export declare class GridRowStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-row': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridRowStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridRowStyleBuilder>;
}
export declare class GridRowDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridRowStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridRowDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridRowDirective, never, never, {}, {}, never, never, true, never>;
}
/**
 * 'grid-row' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
export declare class DefaultGridRowDirective extends GridRowDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridRowDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridRowDirective, "  [gdRow],  [gdRow.xs], [gdRow.sm], [gdRow.md], [gdRow.lg], [gdRow.xl],  [gdRow.lt-sm], [gdRow.lt-md], [gdRow.lt-lg], [gdRow.lt-xl],  [gdRow.gt-xs], [gdRow.gt-sm], [gdRow.gt-md], [gdRow.gt-lg]", never, { "gdRow": { "alias": "gdRow"; "required": false; }; "gdRow.xs": { "alias": "gdRow.xs"; "required": false; }; "gdRow.sm": { "alias": "gdRow.sm"; "required": false; }; "gdRow.md": { "alias": "gdRow.md"; "required": false; }; "gdRow.lg": { "alias": "gdRow.lg"; "required": false; }; "gdRow.xl": { "alias": "gdRow.xl"; "required": false; }; "gdRow.lt-sm": { "alias": "gdRow.lt-sm"; "required": false; }; "gdRow.lt-md": { "alias": "gdRow.lt-md"; "required": false; }; "gdRow.lt-lg": { "alias": "gdRow.lt-lg"; "required": false; }; "gdRow.lt-xl": { "alias": "gdRow.lt-xl"; "required": false; }; "gdRow.gt-xs": { "alias": "gdRow.gt-xs"; "required": false; }; "gdRow.gt-sm": { "alias": "gdRow.gt-sm"; "required": false; }; "gdRow.gt-md": { "alias": "gdRow.gt-md"; "required": false; }; "gdRow.gt-lg": { "alias": "gdRow.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
