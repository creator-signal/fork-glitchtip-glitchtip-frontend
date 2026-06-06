import { describe, it, expect, beforeEach } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { AlertFormComponent } from "./alert-form.component";

/**
 * The alert form lets a user configure two INDEPENDENT thresholds: an event
 * threshold ("if an event happens X times in Y minutes") and an uptime
 * threshold ("if an uptime monitor is triggered X time in Y minute"). The
 * uptime threshold controls are only meant to be live/validated while the
 * uptime checkbox is checked, and the submit payload must carry the uptime
 * values independently of the event values (and null them out when uptime is
 * off). A regression here silently drops a user's configured uptime threshold,
 * so these are the behaviours worth pinning down.
 */
describe("AlertFormComponent", () => {
  let fixture: ComponentFixture<AlertFormComponent>;
  let component: AlertFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertFormComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertFormComponent);
    component = fixture.componentInstance;
  });

  it("starts with uptime off and no uptime interval validators", () => {
    fixture.detectChanges(); // runs ngOnInit

    expect(component.projectFormUptime.value).toBeFalsy();
    // No required validator while uptime is disabled.
    expect(component.projectFormUptimeQuantity.validator).toBeNull();
    expect(component.projectFormUptimeTimespan.validator).toBeNull();
  });

  it("toggling uptime on reveals + validates the uptime quantity/timespan controls", () => {
    fixture.detectChanges();

    component.toggleUptime();

    expect(component.projectFormUptime.value).toBe(true);
    // Defaults to 1/1 like the event threshold.
    expect(component.projectFormUptimeQuantity.value).toBe(1);
    expect(component.projectFormUptimeTimespan.value).toBe(1);
    // Required validators are now attached: emptying a control invalidates it.
    component.projectFormUptimeQuantity.setValue("");
    expect(component.projectFormUptimeQuantity.valid).toBe(false);
  });

  it("toggling uptime off again clears the uptime controls and their validators", () => {
    fixture.detectChanges();

    component.toggleUptime(); // on
    component.toggleUptime(); // off

    expect(component.projectFormUptime.value).toBe(false);
    expect(component.projectFormUptimeQuantity.value).toBe("");
    expect(component.projectFormUptimeTimespan.value).toBe("");
    expect(component.projectFormUptimeQuantity.validator).toBeNull();
    expect(component.projectFormUptimeTimespan.validator).toBeNull();
  });

  it("prefills the uptime controls from inputs and validates them when uptime starts enabled", () => {
    fixture.componentRef.setInput("uptime", true);
    fixture.componentRef.setInput("uptimeQuantity", 3);
    fixture.componentRef.setInput("uptimeTimespanMinutes", 7);
    fixture.detectChanges();

    expect(component.projectFormUptimeQuantity.value).toBe("3");
    expect(component.projectFormUptimeTimespan.value).toBe("7");
    expect(component.projectFormUptimeQuantity.validator).not.toBeNull();
    expect(component.projectFormUptimeTimespan.validator).not.toBeNull();
  });

  it("defaults a legacy uptime alert (uptime on, null thresholds) to 1/1 so it stays editable", () => {
    // An alert saved before the threshold feature (or on a backend without the
    // columns) comes back with uptime enabled but null quantity/timespan. The
    // required validators would otherwise load an invalid, silently
    // un-submittable edit form.
    fixture.componentRef.setInput("uptime", true);
    fixture.componentRef.setInput("uptimeQuantity", null);
    fixture.componentRef.setInput("uptimeTimespanMinutes", null);
    fixture.detectChanges();

    expect(component.projectFormUptimeQuantity.value).toBe("1");
    expect(component.projectFormUptimeTimespan.value).toBe("1");
    // Valid, so the Update button isn't silently blocked.
    expect(component.projectFormUptimeQuantity.valid).toBe(true);
    expect(component.projectFormUptimeTimespan.valid).toBe(true);
  });

  it("onSubmit() emits the uptime threshold independently of the event threshold", () => {
    fixture.componentRef.setInput("errorAlert", true);
    fixture.componentRef.setInput("timespan", 10);
    fixture.componentRef.setInput("quantity", 5);
    fixture.detectChanges();

    // Enable uptime and give it DIFFERENT values from the event threshold.
    component.toggleUptime();
    component.projectFormUptimeQuantity.setValue(2);
    component.projectFormUptimeTimespan.setValue(8);

    let emitted: any;
    component.alertSubmit.subscribe((value) => (emitted = value));
    component.onSubmit();

    expect(emitted).toEqual({
      timespanMinutes: "10",
      quantity: "5",
      uptime: true,
      uptimeQuantity: 2,
      uptimeTimespanMinutes: 8,
    });
  });

  it("onSubmit() emits null uptime threshold values when uptime is disabled", () => {
    fixture.componentRef.setInput("errorAlert", true);
    fixture.componentRef.setInput("timespan", 4);
    fixture.componentRef.setInput("quantity", 6);
    fixture.detectChanges();

    let emitted: any;
    component.alertSubmit.subscribe((value) => (emitted = value));
    component.onSubmit();

    expect(emitted.uptime).toBeFalsy();
    expect(emitted.uptimeQuantity).toBeNull();
    expect(emitted.uptimeTimespanMinutes).toBeNull();
    // Event threshold still flows through.
    expect(emitted.quantity).toBe("6");
    expect(emitted.timespanMinutes).toBe("4");
  });
});
