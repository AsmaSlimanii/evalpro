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
export declare class GridAreaStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-area': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAreaStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridAreaStyleBuilder>;
}
export declare class GridAreaDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridAreaStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAreaDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridAreaDirective, never, never, {}, {}, never, never, true, never>;
}
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
export declare class DefaultGridAreaDirective extends GridAreaDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridAreaDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridAreaDirective, "  [gdArea],  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]", never, { "gdArea": { "alias": "gdArea"; "required": false; }; "gdArea.xs": { "alias": "gdArea.xs"; "required": false; }; "gdArea.sm": { "alias": "gdArea.sm"; "required": false; }; "gdArea.md": { "alias": "gdArea.md"; "required": false; }; "gdArea.lg": { "alias": "gdArea.lg"; "required": false; }; "gdArea.xl": { "alias": "gdArea.xl"; "required": false; }; "gdArea.lt-sm": { "alias": "gdArea.lt-sm"; "required": false; }; "gdArea.lt-md": { "alias": "gdArea.lt-md"; "required": false; }; "gdArea.lt-lg": { "alias": "gdArea.lt-lg"; "required": false; }; "gdArea.lt-xl": { "alias": "gdArea.lt-xl"; "required": false; }; "gdArea.gt-xs": { "alias": "gdArea.gt-xs"; "required": false; }; "gdArea.gt-sm": { "alias": "gdArea.gt-sm"; "required": false; }; "gdArea.gt-md": { "alias": "gdArea.gt-md"; "required": false; }; "gdArea.gt-lg": { "alias": "gdArea.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
