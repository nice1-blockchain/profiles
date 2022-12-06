import { check, Contract, Name, requireAuth, Table } from 'as-chain'

@table('profiles')
class Profile extends Table {
  @primary
  get primary(): u64 {
      return this.user.N
  }

  constructor(public user: Name = new Name(), public alias: string = '', public avatar: string = '') {}
}

function isValidAvatar(avatar: string = '') : bool {
  const prefix = avatar.substr(0, avatar.indexOf(':'))

  return prefix === 'ipfs' || prefix === 'https' || prefix === 'http'
}

@contract
class Nice1Profiles extends Contract {
  @action('update')
  update(user: Name, alias: string = '', avatar: string = ''): void {
    requireAuth(user)
    if (avatar.length) {
      check(isValidAvatar(avatar), 'Avatar has to be either ipfs:// or https://')
    }

    const mi = Profile.new(this.receiver)
    const it = mi.find(user.N)

    if (it.isOk()) {
      const profile = mi.get(it)
      if (alias.length) {
        profile.alias = alias
      }
      if (avatar.length) {
        profile.avatar = avatar
      }

      mi.update(it, profile, user)
    } else {
      const profile = new Profile(user, alias, avatar)
      mi.store(profile, user)
    }
  }
}
