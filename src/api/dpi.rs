#[derive(Debug, Clone, PartialEq)]
pub enum Position {
    Physical(PhysicalPosition),
    Logical(LogicalPosition),
}

#[derive(Debug, Clone, PartialEq)]
pub enum Size {
    Physical(PhysicalSize),
    Logical(LogicalSize),
}

/// A position represented in logical pixels.
#[derive(Debug, Clone, PartialEq)]
pub struct LogicalPosition(base::LogicalPosition);

impl LogicalPosition {
    pub fn new(x: i32, y: i32) -> Self {
        Self(base::LogicalPosition::new(x, y))
    }

    pub fn from_physical(physical: impl Into<PhysicalPosition>, scale_factor: f64) -> Self {
        physical.into().to_logical(scale_factor)
    }

    pub fn to_physical(self, scale_factor: f64) -> PhysicalPosition {
        let x = self.0.x() as f64 * scale_factor;
        let y = self.0.y() as f64 * scale_factor;

        PhysicalPosition::new(x as i32, y as i32)
    }

    pub fn x(&self) -> i32 {
        self.0.x()
    }
    pub fn set_x(&self, x: i32) {
        self.0.set_x(x)
    }
    pub fn y(&self) -> i32 {
        self.0.y()
    }
    pub fn set_y(&self, y: i32) {
        self.0.set_y(y)
    }
}

impl From<LogicalPosition> for Position {
    fn from(pos: LogicalPosition) -> Self {
        Position::Logical(pos)
    }
}

/// A size represented in logical pixels.
#[derive(Debug, Clone, PartialEq)]
pub struct LogicalSize(base::LogicalSize);

impl LogicalSize {
    pub fn new(x: u32, y: u32) -> Self {
        Self(base::LogicalSize::new(x, y))
    }

    pub fn width(&self) -> u32 {
        self.0.width()
    }
    pub fn set_width(&self, x: u32) {
        self.0.set_width(x)
    }
    pub fn height(&self) -> u32 {
        self.0.height()
    }
    pub fn set_height(&self, y: u32) {
        self.0.set_height(y)
    }
}

impl From<LogicalSize> for Size {
    fn from(size: LogicalSize) -> Self {
        Size::Logical(size)
    }
}




/// A position represented in physical pixels.
#[derive(Debug, Clone, PartialEq)]
pub struct PhysicalPosition(base::PhysicalPosition);

impl PhysicalPosition {
    pub fn new(x: i32, y: i32) -> Self {
        Self(base::PhysicalPosition::new(x, y))
    }

    #[inline]
    pub fn from_logical(logical: impl Into<LogicalPosition>, scale_factor: f64) -> Self {
        logical.into().to_physical(scale_factor)
    }

    #[inline]
    pub fn to_logical(&self, scale_factor: f64) -> LogicalPosition {
        let x = self.0.x() as f64 / scale_factor;
        let y = self.0.y() as f64 / scale_factor;

        LogicalPosition::new(x as i32, y as i32)
    }

    pub fn x(&self) -> i32 {
        self.0.x()
    }
    pub fn set_x(&self, x: i32) {
        self.0.set_x(x)
    }
    pub fn y(&self) -> i32 {
        self.0.y()
    }
    pub fn set_y(&self, y: i32) {
        self.0.set_y(y)
    }

}

impl From<PhysicalPosition> for Position {
    fn from(pos: PhysicalPosition) -> Self {
        Position::Physical(pos)
    }
}

/// A size represented in physical pixels.
#[derive(Debug, Clone, PartialEq)]
pub struct PhysicalSize(base::PhysicalSize);

impl PhysicalSize {
    pub fn new(x: u32, y: u32) -> Self {
        Self(base::PhysicalSize::new(x, y))
    }

    pub fn to_logical(self, scale_factor: u32) -> LogicalSize {
        LogicalSize(self.0.toLogical(scale_factor))
    }

    pub fn width(&self) -> u32 {
        self.0.width()
    }
    pub fn set_width(&self, x: u32) {
        self.0.set_width(x)
    }
    pub fn height(&self) -> u32 {
        self.0.height()
    }
    pub fn set_height(&self, y: u32) {
        self.0.set_height(y)
    }
}

impl From<PhysicalSize> for Size {
    fn from(size: PhysicalSize) -> Self {
        Size::Physical(size)
    }
}



mod base {
    use wasm_bindgen::prelude::wasm_bindgen;

    #[wasm_bindgen(module = "/src/scripts/api/dpi.js")]
    extern "C" {
        #[derive(Debug, Clone, PartialEq)]
        pub type LogicalPosition;
        #[wasm_bindgen(constructor)]
        pub fn new(x: i32, y: i32) -> LogicalPosition;
        #[wasm_bindgen(method, getter)]
        pub fn x(this: &LogicalPosition) -> i32;
        #[wasm_bindgen(method, setter)]
        pub fn set_x(this: &LogicalPosition, x: i32);
        #[wasm_bindgen(method, getter)]
        pub fn y(this: &LogicalPosition) -> i32;
        #[wasm_bindgen(method, setter)]
        pub fn set_y(this: &LogicalPosition, y: i32);
    }

    #[wasm_bindgen(module = "/src/scripts/api/dpi.js")]
    extern "C" {
        #[derive(Debug, Clone, PartialEq)]
        pub type PhysicalPosition;
        #[wasm_bindgen(constructor)]
        pub fn new(x: i32, y: i32) -> PhysicalPosition;
        #[wasm_bindgen(method)]
        pub fn toLogical(this: &PhysicalPosition, scaleFactor: i32) -> LogicalPosition;
        #[wasm_bindgen(method, getter)]
        pub fn x(this: &PhysicalPosition) -> i32;
        #[wasm_bindgen(method, setter)]
        pub fn set_x(this: &PhysicalPosition, x: i32);
        #[wasm_bindgen(method, getter)]
        pub fn y(this: &PhysicalPosition) -> i32;
        #[wasm_bindgen(method, setter)]
        pub fn set_y(this: &PhysicalPosition, y: i32);
    }

    #[wasm_bindgen(module = "/src/scripts/api/dpi.js")]
    extern "C" {
        #[derive(Debug, Clone, PartialEq)]
        pub type LogicalSize;
        #[wasm_bindgen(constructor)]
        pub fn new(width: u32, height: u32) -> LogicalSize;
        #[wasm_bindgen(method, getter)]
        pub fn width(this: &LogicalSize) -> u32;
        #[wasm_bindgen(method, setter)]
        pub fn set_width(this: &LogicalSize, width: u32);
        #[wasm_bindgen(method, getter)]
        pub fn height(this: &LogicalSize) -> u32;
        #[wasm_bindgen(method, setter)]
        pub fn set_height(this: &LogicalSize, height: u32);
    }

    #[wasm_bindgen(module = "/src/scripts/api/dpi.js")]
    extern "C" {
        #[derive(Debug, Clone, PartialEq)]
        pub type PhysicalSize;
        #[wasm_bindgen(constructor)]
        pub fn new(width: u32, height: u32) -> PhysicalSize;
        #[wasm_bindgen(method)]
        pub fn toLogical(this: &PhysicalSize, scaleFactor: u32) -> LogicalSize;
        #[wasm_bindgen(method, getter)]
        pub fn width(this: &PhysicalSize) -> u32;
        #[wasm_bindgen(method, setter)]
        pub fn set_width(this: &PhysicalSize, width: u32);
        #[wasm_bindgen(method, getter)]
        pub fn height(this: &PhysicalSize) -> u32;
        #[wasm_bindgen(method, setter)]
        pub fn set_height(this: &PhysicalSize, height: u32);
    }

}