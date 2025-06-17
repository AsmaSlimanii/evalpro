import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridRowsParent {
    inline: boolean;
}
export declare class GridRowsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridRowsParent): {
        display: string;
        'grid-auto-rows': string;
        'grid-template-rows': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridRowsStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridRowsStyleBuilder>;
}
export declare class GridRowsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridRowsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridRowsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridRowsDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export declare class DefaultGridRowsDirective extends GridRowsDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridRowsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridRowsDirective, "  [gdRows],  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]", never, { "gdRows": { "alias": "gdRows"; "required": false; }; "gdRows.xs": { "alias": "gdRows.xs"; "required": false; }; "gdRows.sm": { "alias": "gdRows.sm"; "required": false; }; "gdRows.md": { "alias": "gdRows.md"; "required": false; }; "gdRows.lg": { "alias": "gdRows.lg"; "required": false; }; "gdRows.xl": { "alias": "gdRows.xl"; "required": false; }; "gdRows.lt-sm": { "alias": "gdRows.lt-sm"; "required": false; }; "gdRows.lt-md": { "alias": "gdRows.lt-md"; "required": false; }; "gdRows.lt-lg": { "alias": "gdRows.lt-lg"; "required": false; }; "gdRows.lt-xl": { "alias": "gdRows.lt-xl"; "required": false; }; "gdRows.gt-xs": { "alias": "gdRows.gt-xs"; "required": false; }; "gdRows.gt-sm": { "alias": "gdRows.gt-sm"; "required": false; }; "gdRows.gt-md": { "alias": "gdRows.gt-md"; "required": false; }; "gdRows.gt-lg": { "alias": "gdRows.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
