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
export declare class GridColumnStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-column': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridColumnStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridColumnStyleBuilder>;
}
export declare class GridColumnDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridColumnDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridColumnDirective, never, never, {}, {}, never, never, true, never>;
}
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
export declare class DefaultGridColumnDirective extends GridColumnDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridColumnDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridColumnDirective, "  [gdColumn],  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]", never, { "gdColumn": { "alias": "gdColumn"; "required": false; }; "gdColumn.xs": { "alias": "gdColumn.xs"; "required": false; }; "gdColumn.sm": { "alias": "gdColumn.sm"; "required": false; }; "gdColumn.md": { "alias": "gdColumn.md"; "required": false; }; "gdColumn.lg": { "alias": "gdColumn.lg"; "required": false; }; "gdColumn.xl": { "alias": "gdColumn.xl"; "required": false; }; "gdColumn.lt-sm": { "alias": "gdColumn.lt-sm"; "required": false; }; "gdColumn.lt-md": { "alias": "gdColumn.lt-md"; "required": false; }; "gdColumn.lt-lg": { "alias": "gdColumn.lt-lg"; "required": false; }; "gdColumn.lt-xl": { "alias": "gdColumn.lt-xl"; "required": false; }; "gdColumn.gt-xs": { "alias": "gdColumn.gt-xs"; "required": false; }; "gdColumn.gt-sm": { "alias": "gdColumn.gt-sm"; "required": false; }; "gdColumn.gt-md": { "alias": "gdColumn.gt-md"; "required": false; }; "gdColumn.gt-lg": { "alias": "gdColumn.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
