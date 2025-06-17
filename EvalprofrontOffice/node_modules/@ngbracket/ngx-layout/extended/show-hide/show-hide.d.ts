import { AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { BaseDirective2, LayoutConfigOptions, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface ShowHideParent {
    display: string;
    isServer: boolean;
}
export declare class ShowHideStyleBuilder extends StyleBuilder {
    buildStyles(show: string, parent: ShowHideParent): {
        display: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ShowHideStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ShowHideStyleBuilder>;
}
export declare class ShowHideDirective extends BaseDirective2 implements AfterViewInit, OnChanges {
    protected layoutConfig: LayoutConfigOptions;
    protected platformId: Object;
    protected serverModuleLoaded: boolean;
    protected DIRECTIVE_KEY: string;
    /** Original DOM Element CSS display style */
    protected display: string;
    protected hasLayout: boolean;
    protected hasFlexChild: boolean;
    constructor(elementRef: ElementRef, styleBuilder: ShowHideStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller, layoutConfig: LayoutConfigOptions, platformId: Object, serverModuleLoaded: boolean);
    ngAfterViewInit(): void;
    /**
     * On changes to any @Input properties...
     * Default to use the non-responsive Input value ('fxShow')
     * Then conditionally override with the mq-activated Input's current value
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     *  Watch for these extra triggers to update fxShow, fxHide stylings
     */
    protected trackExtraTriggers(): void;
    /**
     * Override accessor to the current HTMLElement's `display` style
     * Note: Show/Hide will not change the display to 'flex' but will set it to 'block'
     * unless it was already explicitly specified inline or in a CSS stylesheet.
     */
    protected getDisplayStyle(): string;
    /** Validate the visibility value and then update the host's inline display style */
    protected updateWithValue(value?: boolean | string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ShowHideDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ShowHideDirective, never, never, {}, {}, never, never, true, never>;
}
/**
 * 'show' Layout API directive
 */
export declare class DefaultShowHideDirective extends ShowHideDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultShowHideDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultShowHideDirective, "  [fxShow], [fxShow.print],  [fxShow.xs], [fxShow.sm], [fxShow.md], [fxShow.lg], [fxShow.xl],  [fxShow.lt-sm], [fxShow.lt-md], [fxShow.lt-lg], [fxShow.lt-xl],  [fxShow.gt-xs], [fxShow.gt-sm], [fxShow.gt-md], [fxShow.gt-lg],  [fxHide], [fxHide.print],  [fxHide.xs], [fxHide.sm], [fxHide.md], [fxHide.lg], [fxHide.xl],  [fxHide.lt-sm], [fxHide.lt-md], [fxHide.lt-lg], [fxHide.lt-xl],  [fxHide.gt-xs], [fxHide.gt-sm], [fxHide.gt-md], [fxHide.gt-lg]", never, { "fxShow": { "alias": "fxShow"; "required": false; }; "fxShow.print": { "alias": "fxShow.print"; "required": false; }; "fxShow.xs": { "alias": "fxShow.xs"; "required": false; }; "fxShow.sm": { "alias": "fxShow.sm"; "required": false; }; "fxShow.md": { "alias": "fxShow.md"; "required": false; }; "fxShow.lg": { "alias": "fxShow.lg"; "required": false; }; "fxShow.xl": { "alias": "fxShow.xl"; "required": false; }; "fxShow.lt-sm": { "alias": "fxShow.lt-sm"; "required": false; }; "fxShow.lt-md": { "alias": "fxShow.lt-md"; "required": false; }; "fxShow.lt-lg": { "alias": "fxShow.lt-lg"; "required": false; }; "fxShow.lt-xl": { "alias": "fxShow.lt-xl"; "required": false; }; "fxShow.gt-xs": { "alias": "fxShow.gt-xs"; "required": false; }; "fxShow.gt-sm": { "alias": "fxShow.gt-sm"; "required": false; }; "fxShow.gt-md": { "alias": "fxShow.gt-md"; "required": false; }; "fxShow.gt-lg": { "alias": "fxShow.gt-lg"; "required": false; }; "fxHide": { "alias": "fxHide"; "required": false; }; "fxHide.print": { "alias": "fxHide.print"; "required": false; }; "fxHide.xs": { "alias": "fxHide.xs"; "required": false; }; "fxHide.sm": { "alias": "fxHide.sm"; "required": false; }; "fxHide.md": { "alias": "fxHide.md"; "required": false; }; "fxHide.lg": { "alias": "fxHide.lg"; "required": false; }; "fxHide.xl": { "alias": "fxHide.xl"; "required": false; }; "fxHide.lt-sm": { "alias": "fxHide.lt-sm"; "required": false; }; "fxHide.lt-md": { "alias": "fxHide.lt-md"; "required": false; }; "fxHide.lt-lg": { "alias": "fxHide.lt-lg"; "required": false; }; "fxHide.lt-xl": { "alias": "fxHide.lt-xl"; "required": false; }; "fxHide.gt-xs": { "alias": "fxHide.gt-xs"; "required": false; }; "fxHide.gt-sm": { "alias": "fxHide.gt-sm"; "required": false; }; "fxHide.gt-md": { "alias": "fxHide.gt-md"; "required": false; }; "fxHide.gt-lg": { "alias": "fxHide.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
