<?php
namespace Computech\Bundle\CommonBundle\Security\Authentication\Token;

use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;

/**
 * Token containing the unique string generated by FileMaker passed via the request URI
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class FileMakerBridgeToken extends AbstractToken
{
    /**
     * @var string
     */
    private $token;

    /**
     * @var boolean
     */
    private $clear;

    /**
     * {@inheritDoc}
     */
    public function __construct(array $roles = array())
    {
        parent::__construct($roles);

        $this->setAuthenticated(count($roles) > 0);
    }

    /**
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @return boolean
     */
    public function getClear()
    {
        return $this->clear;
    }

    /**
     * @param string $token
     */
    public function setToken($token)
    {
        $this->token = $token;
    }

    /**
     * @param boolean $clear
     */
    public function setClear($clear)
    {
        $this->clear = $clear;
    }

    /**
     * @return null
     */
    public function getCredentials()
    {
        return null;
    }
}