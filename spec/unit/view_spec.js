describe 'View'
  describe '.urlKey()'
    it 'extracts a url_key from a sale url'
      var env = { u: "http://localhost/s/gucci" }

      var view = new v.View(env)
      view.urlKey().should.equal "gucci"
    end
  end

  describe '.productId()'
    it 'extracts the product id'
      var env = { u: "http://localhost/s/gucci/product/12345" }

      var view = new v.View(env)
      view.productId().should.equal "12345"
    end
  end

  describe '.event()'
    it 'extracts the cart_add event'
      var env = { events: "scAdd,scJunk" }
      var view = new v.View(env);

      view.event().should.equal "cart_add"
    end
  end
end