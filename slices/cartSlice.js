import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items:[],
}
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.items = [...state.items, action.payload]
    },
    removeFromCart: (state, action) => {
      let newCart = [...state.items];
      let itemIndex = state.items.findIndex(item => item.id == action.payload.id);
      if(itemIndex >= 0) {
        newCart.splice(itemIndex, 1);
      } else {
        console.log("cant remove the item that is not added to cart!")
      }
      state.items = newCart;
    },
    // ใหม่: อัปเดตหมายเหตุของ "ทุกชิ้น" ที่เป็นเมนูเดียวกันในตะกร้า
    updateNoteForFood: (state, action) => {
      const { food_id, note } = action.payload;
      state.items = state.items.map(item =>
        (item.food_id || item.id) === food_id ? { ...item, note } : item
      );
    },
    emptyCart: (state, action) => {
      state.items = [];
    },
  },
})

// Action creators
export const { addToCart, removeFromCart, updateNoteForFood, emptyCart } = cartSlice.actions;

export const selectCartItems = state => state.cart.items;

export const selectCartItemsById = (state, id) => state.cart.items.filter(item => item.id == id);

// ปรับวิธีบวกเลขให้สะอาดตามมาตรฐาน JS: total + item.price
export const selectCartTotal = state => state.cart.items.reduce((total, item) => total + (item.price || 0), 0);

export default cartSlice.reducer;