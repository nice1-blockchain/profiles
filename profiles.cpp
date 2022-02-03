#include <eosio/eosio.hpp>

class [[eosio::contract]] profiles : public eosio::contract {
  public:
    using eosio::contract::contract;

    profiles(eosio::name receiver, eosio::name code, eosio::datastream<const char*> ds):contract(receiver, code, ds) {}

    [[eosio::action]] void update(eosio::name user, std::string alias, std::string avatar) {
      eosio::require_auth(user);
      eosio::check(!isValidAvatar(avatar), "Avatar has to be either ipfs:// or https://");

      profile_index profiles(get_self(), get_first_receiver().value);
      auto iterator = profiles.find(user.value);
      if (iterator == profiles.end()) {
        profiles.emplace(user, [&](auto& row) {
          row.user = user;
          row.alias = alias;
          row.avatar = avatar;
        });
      } else {
        profiles.modify(iterator, user, [&](auto& row) {
          row.user = user;
          row.alias = alias;
          row.avatar = avatar;
        });
      }
    }

    [[eosio::action]] void setalias(eosio::name user, std::string alias) {
      eosio::require_auth(user);

      profile_index profiles(get_self(), get_first_receiver().value);
      auto iterator = profiles.find(user.value);
      if (iterator == profiles.end()) {
        profiles.emplace(user, [&](auto& row) {
          row.user = user;
          row.alias = alias;
        });
      } else {
        profiles.modify(iterator, user, [&](auto& row) {
          row.user = user;
          row.alias = alias;
        });
      }
    }

    [[eosio::action]] void setavatar(eosio::name user, std::string avatar) {
      eosio::require_auth(user);
      eosio::check(!isValidAvatar(avatar), "Avatar has to be either ipfs:// or https://");

      profile_index profiles(get_self(), get_first_receiver().value);

      auto iterator = profiles.find(user.value);
      if (iterator == profiles.end()) {
        profiles.emplace(user, [&](auto& row) {
          row.user = user;
          row.avatar = avatar;
        });
      } else {
        profiles.modify(iterator, user, [&](auto& row) {
          row.user = user;
          row.avatar = avatar;
        });
      }
    }

  private:
    struct [[eosio::table]] profile {
      eosio::name user;
      std::string alias;
      std::string avatar;

      uint64_t primary_key() const {
        return user.value;
      }

    };
    using profile_index = eosio::multi_index<"profiles"_n, profile>;

    bool isValidAvatar(std::string avatar) {
      std::string prefix = avatar.substr(avatar.find(":"));

      return prefix == "ipfs" || prefix == "http" || prefix == "https";
    }
};
