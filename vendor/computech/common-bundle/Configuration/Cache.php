<?php
namespace Computech\Bundle\CommonBundle\Configuration;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache as BaseCache;

/**
 * Extend @Cache annotation to automatically set Expires header when setting max-age
 *
 * @Annotation
 */
class Cache extends BaseCache
{
    public function setMaxAge($maxage)
    {
        $this->setExpires('+' . $maxage . ' seconds');

        parent::setMaxAge($maxage);
    }
}